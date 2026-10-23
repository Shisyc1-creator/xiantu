"""Build an offline review ZIP from tracked prototype files, never player saves."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
from urllib.parse import unquote, urlsplit
import zipfile

class ResourceParser(HTMLParser):
    def __init__(self):
        super().__init__();self.refs=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if attrs.get('src'):
            self.refs.append((attrs['src'],True))
        if tag=='video' and attrs.get('poster'):
            self.refs.append((attrs['poster'],True))
        if tag=='object' and attrs.get('data'):
            self.refs.append((attrs['data'],True))
        if tag in ('link','image','use') and attrs.get('href'):
            self.refs.append((attrs['href'],True))
        if tag=='a' and attrs.get('href'):
            self.refs.append((attrs['href'],False))

def build_bundle(root,files,commit,output):
    root=Path(root).resolve();output=Path(output)
    if output.exists():raise FileExistsError(output)
    if not re.fullmatch(r'[0-9a-f]{40}',commit):raise ValueError('invalid commit SHA')
    if len(set(files))!=len(files):raise ValueError('duplicate input path')
    payload={}
    for name in sorted(files):
        p=PurePosixPath(name)
        if p.is_absolute() or '..' in p.parts or not name.startswith('prototype/'):
            raise ValueError('path escape: '+name)
        source=root/name
        if source.is_symlink() or any(parent.is_symlink() for parent in source.parents if parent!=root and root in parent.parents):
            raise ValueError('symlink not allowed: '+name)
        if not source.resolve().is_relative_to(root/'prototype'):
            raise ValueError('path escape: '+name)
        if not source.is_file():raise ValueError('missing tracked file: '+name)
        payload[name]=source.read_bytes()
    for entry in ('prototype/index.html','prototype/developer.html'):
        if entry not in payload:raise ValueError('missing entry: '+entry)
    def reference(value,base,active=True):
        value=value.strip();u=urlsplit(value)
        if not value or value.startswith('#') or u.scheme in ('data','blob'):return
        if u.scheme or u.netloc:
            if active:raise ValueError('external runtime resource: '+value)
            return
        if u.path.startswith('/') or '\\' in u.path:raise ValueError('path escape: '+value)
        candidate=root/base/unquote(u.path)
        if candidate.is_symlink() or any(parent.is_symlink() for parent in candidate.parents if parent!=root and root in parent.parents):
            raise ValueError('symlink resource not allowed: '+value)
        # URLs refer to archive member paths, not the target of a filesystem link.
        path=Path(os.path.abspath(candidate))
        if not path.is_relative_to(root/'prototype'):raise ValueError('path escape: '+value)
        name=path.relative_to(root).as_posix()
        if name not in payload:raise ValueError('missing resource: '+name)
    for name,raw in payload.items():
        suffix=Path(name).suffix
        if suffix not in ('.html','.css','.js'):continue
        text=raw.decode('utf-8')
        if suffix=='.html':
            parser=ResourceParser();parser.feed(text)
            for ref,active in parser.refs:reference(ref,Path(name).parent,active)
        if suffix in ('.html','.css'):
            for match in re.finditer(r'url\(\s*[\'"]?([^\'"\)]+)[\'"]?\s*\)',text,re.IGNORECASE):
                reference(match[1],Path(name).parent)
        # Existing atlas artwork uses document-relative static JS string literals.
        if suffix in ('.html','.js'):
            for match in re.finditer(r'[\'"](assets/art/[^\'"\s]+)[\'"]',text):
                reference(match[1],Path('prototype'))
    manifest={'source_commit':commit,'entry':'prototype/index.html','developer_entry':'prototype/developer.html','file_count':len(payload),'files':[{'path':name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()} for name,raw in payload.items()],
              'scope':'tracked prototype only; static resources checked; no deployment or save migration'}
    instructions='''# 仙途 · 试玩审阅包

先解压整个压缩包，再打开prototype/developer.html进行独立开发测试。正常入口为prototype/index.html；请保留完整prototype目录，不能只移动HTML。

此包来自独立开发分支，未合并、未上线。先导出原存档备份；本包不携带玩家存档，也不自动把旧网址/旧目录/其他浏览器的存档搬过来。不要覆盖原项目目录。

manifest.json记录代码提交及每个运行文件的SHA256。静态资源检查不等于任意动态路径、手机真机或长期平衡验收。

恢复旧代码时，存档不随代码自动回退；需要使用先前单独导出的备份，先在隔离测试入口验证。不要把测试局导入正常档。
'''
    output.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(output,'x',compression=zipfile.ZIP_DEFLATED) as z:
        for name,raw in payload.items():z.writestr(name,raw)
        z.writestr('manifest.json',json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
        z.writestr('REVIEW.md',instructions)
    return manifest

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--commit',required=True)
    parser.add_argument('--output',default='.artifacts/xiantu-review.zip')
    args=parser.parse_args();root=Path(__file__).resolve().parents[1]
    files=subprocess.check_output(['git','ls-files','-z','--','prototype'],cwd=root).decode().split('\0')
    manifest=build_bundle(root,[p for p in files if p],args.commit,root/args.output)
    print(json.dumps({'ok':True,'commit':args.commit,'files':manifest['file_count'],'output':args.output},ensure_ascii=False))

if __name__=='__main__':main()
