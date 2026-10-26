/* Export the reviewed, memory-only interface preview as one offline HTML file. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),base=path.join(root,'prototype');
const image='data:image/webp;base64,'+fs.readFileSync(path.join(base,'assets/art/immortal-dawn-v1.webp')).toString('base64');
let html=fs.readFileSync(path.join(base,'ui-preview.html'),'utf8');
const css=fs.readFileSync(path.join(base,'ui-preview/ui-shell.css'),'utf8').replaceAll("../assets/art/immortal-dawn-v1.webp",image);
html=html.replace(/<link[^>]+href="ui-preview\/ui-shell\.css"[^>]*>/,'<style>'+css+'</style>');
for(const file of ['route-registry.js','ui-shell.js']){
 const source=fs.readFileSync(path.join(base,'ui-preview',file),'utf8').replace(/<\/script/gi,'<\\/script');
 html=html.replace(new RegExp('<script[^>]+src="ui-preview/'+file.replace('.','\\.')+'"[^>]*><\\/script>'),()=>'<script>'+source+'</script>');
}
html=html.replaceAll('assets/art/immortal-dawn-v1.webp',image);
if(/(?:src|href)="(?:ui-preview\/|assets\/)/.test(html))throw Error('An external preview resource was not embedded');
const destination=path.resolve(process.argv[2]||path.join(root,'outputs/xiantu-ui-preview.html'));
fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,html);
console.log(destination+' ('+Buffer.byteLength(html)+' bytes)');
