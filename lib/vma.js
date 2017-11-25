// Variable Moving Average, by Tushar S. Chande
module.exports = function container (get, set, clear) {
  return function vma (s, key, length, source_key) {
    if (!source_key) source_key = 'close'
    let k = 1.0 / length;
    if (s.lookback[0] != undefined)
    {
        let pdm = Math.max(s.period[source_key] - s.lookback[0][source_key], 0);
        let mdm = Math.max(s.lookback[0][source_key] - s.period[source_key], 0);
        let pdmS = s.period['pdmS'] = k * pdm + ((s.lookback[0]['pdmS'] != undefined) ? s.lookback[0]['pdmS'] * (1 - k) : 0);
        let mdmS = s.period['mdmS'] = k * mdm + ((s.lookback[0]['mdmS'] != undefined) ? s.lookback[0]['mdmS'] * (1 - k) : 0);
        let s0 = pdmS + mdmS;
        let pdi = pdmS / s0;
        let mdi = mdmS / s0;
        let pdiS = s.period['pdiS'] = k * pdi + ((s.lookback[0]['pdiS'] != undefined) ? s.lookback[0]['pdiS'] * (1 - k) : 0);
        let mdiS = s.period['mdiS'] = k * mdi + ((s.lookback[0]['mdiS'] != undefined) ? s.lookback[0]['mdiS'] * (1 - k) : 0);
        let d = Math.abs(pdiS - mdiS);
        let s1 = pdiS + mdiS;
        let iS = s.period['iS'] = k * d / s1 + ((s.lookback[0]['iS'] != undefined) ? s.lookback[0]['iS'] * (1 - k) : 0);
    }
    if (s.lookback.length > length) {
        let hhv = 0, llv = 0;
        for (var i=length-1; i>=0; i--) {
            let iS = s.lookback[i]['iS'];
            hhv = Math.max(hhv, iS);
            llv = Math.min(llv, iS);
        }
        let d1 = hhv - llv;
        let vI = (s.period['iS'] - llv) / d1;
        let vma = s.period['vma'] = k * vI * s.period[source_key] + 
            ((s.lookback[0]['vma'] != undefined) ? s.lookback[0]['vma'] * (1 - k * vI) : 0)
        s.period[key] = vma;
    }   
  }
}
