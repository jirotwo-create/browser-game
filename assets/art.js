export function icon(name, cls='') {
 const paths={
 sword:'<path d="m19 3 2 2-9 11-3-3z"/><path d="m5 12 7 7M8 16l-5 5m1-3 2 2"/>',
 armor:'<path d="m8 3-5 4 3 5v8l6 2 6-2v-8l3-5-5-4-4 3z"/><path d="m8 8 4 3 4-3m-4 3v8"/>',
 scythe:'<path d="M8 3v19M4 5c9-6 16 0 16 8-4-5-8-6-12-6"/>',
 skull:'<path d="M6 15c-7-11 3-16 9-11 5 3 5 10 2 12v5H7v-5z"/><path d="m7 10 3 1m4 0 3-1m-6 10v-3m3 3v-3m-2-4v2"/>',
 drop:'<path d="M12 2c-2 5-8 9-8 14a8 8 0 0 0 16 0c0-5-6-9-8-14z"/><path d="m7 16 2 3"/>',
 bone:'<path d="M6 8C0 8 3 0 7 4c3-3 6 0 3 3l7 7c3-3 6 0 3 3 4 4-4 7-4 1L8 10z"/>',
 shield:'<path d="m12 2 9 4-2 12-7 5-7-5L3 6z"/><path d="M12 6v12M7 10h10"/>',
 crown:'<path d="m3 5 5 6 4-8 4 8 5-6-3 14H6z"/><path d="M6 22h12"/>',
 flame:'<path d="M12 2c4 7-3 7 3 12l3-5c8 14-10 18-13 9-2-6 5-8 7-16z"/><path d="M12 15c-7 9 7 9 0 0"/>',
 rune:'<path d="M12 2v20m-7-6 14-8M5 8l14 8M5 3v5m14 8v5"/>',
 eye:'<path d="M2 12s8-13 20 0c-12 13-20 0-20 0z"/><path d="m12 7 3 5-3 5-3-5z"/>',
 moon:'<path d="M17 3C1-3-3 18 11 22c5 1 9-2 11-6C10 19 6 9 17 3z"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="m12 6 4 6-4 6-4-6z"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 book:'<path d="M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2zm0 0v16"/>',
 fire:'<path d="M12 2c4 7-3 7 3 12l3-5c8 14-10 18-13 9-2-6 5-8 7-16z"/>',
 plus:'<path d="M12 4v16M4 12h16"/>',
 check:'<path d="m5 12 4 4L20 5"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
 sound:'<path d="m4 9 4 0 5-5v16l-5-5H4zm13-2c4 2 4 8 0 10"/>'
 };
 return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.rune}</svg>`;
}
export function scene(kind='knight') {
 const colors={knight:'#a2a897',wretch:'#859673',keeper:'#b3a086',wing:'#9b8ba0',king:'#bea07a'};
 const c=colors[kind]||colors.knight;
 return `<svg class="world-art" viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A low polygon armored revenant before a ruined cathedral in a misty forest">
 <defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#1a2525"/><stop offset="1" stop-color="#3c4640"/></linearGradient><radialGradient id="mist"><stop stop-color="#a5ad88" stop-opacity=".2"/><stop offset="1" stop-color="#1a231b" stop-opacity="0"/></radialGradient><linearGradient id="ground" x2="0" y2="1"><stop stop-color="#202722"/><stop offset="1" stop-color="#0c110e"/></linearGradient><linearGradient id="steel"><stop stop-color="${c}"/><stop offset=".45" stop-color="#535e57"/><stop offset="1" stop-color="#202b29"/></linearGradient><filter id="haze"><feGaussianBlur stdDeviation="9"/></filter></defs>
 <path fill="url(#sky)" d="M0 0h800v470H0z"/><circle cx="546" cy="95" r="48" fill="#b9c0a1" opacity=".28"/><circle cx="529" cy="79" r="44" fill="#24302e"/>
 <path d="m100 285 80-175 20 91 50-131 45 190 70-87 20 82 85-166 40 176 40-124 20 129 60-175 45 119 45-55 40 138" fill="#172320"/>
 <g fill="#17211e" stroke="#34413a" stroke-width="2"><path d="M480 310V182l30-28v-41l13-19 13 19v41l27 28v128z"/><path d="M537 310V162l28-55 15 34 17-75 20 74 14-28 30 50v148z"/><path d="M624 310V190l26-27v-49l13-23 14 23v49l30 27v120z"/><path d="M567 309v-74q25-61 48 0v74" fill="#0d1613"/><path d="M516 194v45m150-45v45m-90-39 16-31 13 31z" fill="#435041"/></g>
 <g fill="#111c18"><path d="M30 0h18l-4 69 43-36-45 63-3 42 55-44-57 80 3 159-29 0 15-146L0 121l28 29 4-56L0 46l32 20z"/><path d="M754 0h20l-6 107 32-31-34 69-2 154h-23l10-144-58-77 60 43 1-41-57-64 58 30z"/><path d="M109 0h10l-8 86 48-38-51 67-8 174H86l9-194-45-62 47 37z"/></g>
 <path d="M0 318 95 279l90 30 90-24 67 28 102-15 68 27 94-26 94 23 110-47v195H0" fill="url(#ground)"/>
 <ellipse cx="398" cy="334" rx="305" ry="47" fill="#8c9d84" opacity=".12" filter="url(#haze)"/><ellipse cx="410" cy="248" rx="260" ry="230" fill="url(#mist)"/>
 <path d="m0 470 169-75 108 11 76-33 104 23 102-8 241 82" fill="#121713"/><g stroke="#47503d" opacity=".55"><path d="m112 425 46-16 50 3m356-7 78 18m-332 10 16-6 31 4M74 370l38-13m516 3 47 8"/></g>
 <ellipse cx="397" cy="392" rx="94" ry="18" fill="#080d0a" opacity=".8"/>
 ${kind==='wing'?'<path d="m365 213-130-84 18 110 67 64 46-25m63-67 133-82-22 110-65 67-47-30" fill="#353639" stroke="#5a585d" stroke-width="3"/>':''}
 <g stroke="#141e1a" stroke-width="2" stroke-linejoin="bevel">
 <path d="m354 206-36 135 36-28 8 50 38-28 30 31 19-53 24 26-28-134" fill="#272927"/>
 <path d="m369 296-13 65-10 35 29 3 15-45 9-50m14-5 5 53 12 47 27-4-9-36-13-63" fill="url(#steel)"/>
 <path d="m356 351 22 7-7 27-24 10 2-21m72-20 22-7 9 38-22 4z" fill="#49514a"/>
 <path d="m349 391-16 13 42 3 4-12m53 0-1 11 37-3-15-14" fill="#1c2823"/>
 <path d="m362 209 31-16 40 14 16 55-20 37-43 10-29-42z" fill="url(#steel)"/>
 <path d="m389 212 8 69 30-56-2 62-37 19-27-36z" fill="#3f4b43"/><path d="m366 226 23-14 31 9-23 8z" fill="${c}" opacity=".75"/>
 <path d="m360 214-25 2-11 28 25 9 26-17m53-24 26 5 14 28-27 7-22-18" fill="url(#steel)"/>
 <path d="m334 246-13 41 17 15 14-50m99 0 10 43-18 17-11-58" fill="#626a5e"/>
 <path d="m321 284-5 30 17 7 10-25m101-1-3 25 18 4 5-20" fill="#35463d"/>
 <path d="m372 167 13-17 27 0 17 17-5 32-27 15-23-14z" fill="url(#steel)"/>
 <path d="m384 154 10-14 15 11 3 18-16 39-17-16z" fill="#687569"/><path d="m381 176 16 5 19-5-4 11-16 2-13-5z" fill="#090f0d"/>
 <path d="m383 177 10 4m9 0 10-4" stroke="#d8b881" stroke-width="3"/>
 <path d="m373 166-7-18 11 9m45 8 12-17-5 25" fill="#8b9584"/>
 ${kind==='wretch'?'<path d="m374 158 14-11 21 5 13 17-5 24-18 12-21-13z" fill="#aaa991"/><path d="m380 170 13 4-4 9-9-4m22-5 13-4-3 10-11 4m-7 1-3 8 9 0m-17 8 24 0m-19-4v9m8-9v10m-39 6-27-18 12 31m85-15 26-22-11 35" stroke="#29342a" stroke-width="3" fill="#162019"/>':''}
 ${kind==='keeper'?'<path d="m367 184 3-29 23-19 28 13 14 26-6 37-18-12-22 5-20-7z" fill="#302e25"/><path d="m379 166 21-13 21 14-5 29-20 7-17-15z" fill="#161c16"/><path d="m386 175 8 2m10 0 8-3" stroke="#ddae70" stroke-width="3"/><path d="M304 324V137m-21 12 20-18 29 8-15 9m-13 3-10 13-1 22 37 0-4-25-12-13z" fill="#827454" stroke="#353526" stroke-width="3"/><path d="M290 187h43m-24 0v8" stroke="#ab976c"/>':''}
 ${kind==='king'?'<path d="m371 156-5-30 16 14 15-26 12 26 20-14-7 32z" fill="#b49a65"/>':''}
 <path d="m319 302-23-14 11 23-12 91 9 25 9-22 4-91 21-8z" fill="#818b77"/>
 <path d="m303 319 2 76-7 16" stroke="#c0c5a6"/>
 <path d="m449 293 23-5 26 21-3 48-28 19-24-34z" fill="#3e4a3e"/><path d="m469 303 13 12-3 31-13 13-8-23z" fill="#636d55"/>
 </g><g fill="#a6b386" opacity=".5"><path d="m204 344 2-4 2 4-2 3zM568 271l2-5 2 5-2 3zM310 141l2-4 2 4-2 3zM481 369l2-4 2 4-2 3z"/></g>
 <path d="M0 450h800v20H0" fill="#0e130f" opacity=".6"/>
 </svg>`;
}
