import importlib.util
from pathlib import Path
import tempfile
import unittest
import zipfile
import json
import hashlib

spec=importlib.util.spec_from_file_location('review_bundle',Path(__file__).with_name('build-review-bundle.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class BundleTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name);self.files=[]
        self.put('prototype/index.html','<script src="assets/app.js"></script><link rel="stylesheet" href="assets/site.css"><img src="assets/art/test.webp">')
        self.put('prototype/developer.html','<a href="index.html?developer=1">test</a>')
        self.put('prototype/assets/app.js','const image="assets/art/test.webp";')
        self.put('prototype/assets/site.css','body{background:url(art/test.webp)}')
        self.put('prototype/assets/art/test.webp',b'fake-image-for-archive-test')
        self.output=self.root/'result.zip'
    def put(self,path,content):
        p=self.root/path;p.parent.mkdir(parents=True,exist_ok=True)
        p.write_bytes(content if isinstance(content,bytes) else content.encode());self.files.append(path)
    def build(self):return m.build_bundle(self.root,self.files,'a'*40,self.output)
    def test_complete_bundle_hashes_and_only_tracked_files(self):
        (self.root/'prototype/private-save.json').write_text('private')
        manifest=self.build()
        with zipfile.ZipFile(self.output) as z:
            self.assertNotIn('prototype/private-save.json',z.namelist())
            self.assertIn('prototype/developer.html',z.namelist())
            self.assertEqual(json.loads(z.read('manifest.json')),manifest)
            for file in manifest['files']:
                self.assertEqual(hashlib.sha256(z.read(file['path'])).hexdigest(),file['sha256'])
    def test_missing_script_fails_without_creating_output(self):
        (self.root/'prototype/assets/app.js').unlink()
        with self.assertRaises(ValueError):self.build()
        self.assertFalse(self.output.exists())
    def test_missing_css_relative_image_fails(self):
        (self.root/'prototype/assets/site.css').write_text('body{background:url(art/lost.webp)}')
        with self.assertRaisesRegex(ValueError,'lost.webp'):self.build()
    def test_html_path_escape_is_rejected(self):
        (self.root/'prototype/index.html').write_text('<script src="../outside.js"></script>')
        with self.assertRaisesRegex(ValueError,'outside|escape'):self.build()
    def test_symlink_is_rejected(self):
        p=self.root/'prototype/assets/app.js';p.unlink();p.symlink_to(self.root/'outside.js')
        (self.root/'outside.js').write_text('secret')
        with self.assertRaisesRegex(ValueError,'symlink|escape'):self.build()
    def test_external_runtime_script_fails(self):
        (self.root/'prototype/index.html').write_text('<script src="https://example.com/x.js"></script>')
        with self.assertRaisesRegex(ValueError,'external'):self.build()
    def test_untracked_symlink_alias_cannot_hide_missing_archive_member(self):
        alias=self.root/'prototype/assets/alias.js';alias.symlink_to('app.js')
        (self.root/'prototype/index.html').write_text('<script src="assets/alias.js"></script>')
        with self.assertRaisesRegex(ValueError,'symlink|missing resource'):self.build()
    def test_audio_runtime_resource_is_checked(self):
        for url in ['https://example.com/a.mp3','assets/missing.mp3']:
            with self.subTest(url=url):
                self.output.unlink(missing_ok=True)
                (self.root/'prototype/index.html').write_text('<audio src="'+url+'"></audio>')
                with self.assertRaisesRegex(ValueError,'external|missing resource'):self.build()
    def test_uppercase_css_url_is_checked(self):
        (self.root/'prototype/assets/site.css').write_text('body{background:URL(https://example.com/a.webp)}')
        with self.assertRaisesRegex(ValueError,'external'):self.build()
    def test_existing_output_is_not_overwritten(self):
        self.output.write_bytes(b'keep')
        with self.assertRaises(FileExistsError):self.build()
        self.assertEqual(self.output.read_bytes(),b'keep')

if __name__=='__main__':unittest.main()
