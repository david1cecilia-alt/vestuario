"""Convierte demo/dist/index.html en una página para artifact (sin doctype/html/head/body propios)."""
s=open('demo/dist/index.html').read()
sec=s.index('<section id="login"') if '<section id="login"' in s else s.index('<section')
h1=s.rfind('</head>',0,sec)          # cierre real del <head> (el JS incrustado contiene textos "</head>")
h0=s.index('<head>')+6
head=s[h0:h1]
b0=s.index('<body>',h1)+6;b1=s.rindex('</body>')
body=s[b0:b1]
first=min(i for i in [head.find('<script'),head.find('<style')] if i>=0)
tail=head[first:]
si=tail.find('<script')
pre,scr=(tail[:si],tail[si:]) if si>=0 else (tail,'')
badge='<div id="demoBadge" role="note" style="position:fixed;z-index:60;left:max(12px,env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));background:var(--ink);color:var(--surface);font:800 12px/1 var(--body);letter-spacing:.08em;text-transform:uppercase;padding:9px 12px;border-radius:10px;opacity:.9;pointer-events:none">Demo · datos de ejemplo · PIN 1234</div>'
out='<title>Vestuario Demo</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'+pre+'\n'+body+'\n'+badge+'\n'+scr
open('demo/vestuario-demo.html','w').write(out)
print(len(out)//1024,'KB · secciones:',body.count('<section'))
