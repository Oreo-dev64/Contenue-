<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>__TITLE__</title>
<style>
@font-face{font-family:'AB';src:url(fonts/archivo.woff2) format('woff2')}
@font-face{font-family:'IT';src:url(fonts/inter.woff2) format('woff2');font-weight:100 900}
@font-face{font-family:'IS';src:url(fonts/serif.woff2) format('woff2');font-style:italic}
@font-face{font-family:'JM';src:url(fonts/mono.woff2) format('woff2')}
html,body{margin:0;background:#050507;overflow:hidden;height:100%}
#stage{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;transform-origin:0 0;background:#0B0B10}
#stage *{box-sizing:border-box}
.L{position:absolute;left:0;top:0}
.T{position:absolute;left:0;top:0;white-space:nowrap;line-height:1}
.full{position:absolute;left:0;top:0;width:1080px;height:1920px}
.p3{transform-style:preserve-3d}
.lt{display:inline-block;overflow:hidden;vertical-align:top;line-height:1.12;padding:0 .08em;margin:0 -.08em}
.lt>span{display:inline-block}
</style></head>
<body>
<div id="stage"></div>
<script src="lib.js"></script>
