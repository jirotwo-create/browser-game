// Shared cast-metal seal. Only bundled decorative assets are exposed to webpages.
(() => {
 const asset=path=>typeof chrome!=='undefined'&&typeof chrome.runtime?.getURL==='function'?chrome.runtime.getURL(path):new URL(path,document.baseURI).href;
 globalThis.DreadwakeHellscriptAssets={materials:asset('assets/infernal-materials.png'),iron:asset('assets/blackened-iron.png'),font:asset('assets/MetalMania-Regular.ttf')};
 globalThis.DreadwakeHellscript=`<span class="hellscript-seal" aria-hidden="true" style="background-image:url('${globalThis.DreadwakeHellscriptAssets.materials}')"></span>`;
})();
