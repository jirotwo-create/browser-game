// Tests that target gameplay explicitly dismiss the optional first-deployment prologue.
exports.deploy=async page=>{await page.click('#start');if(await page.evaluate(()=>nullDistrict.state.mode==='intro'))await page.click('#opening-skip');await page.waitForFunction(()=>nullDistrict.state.mode==='playing');};
