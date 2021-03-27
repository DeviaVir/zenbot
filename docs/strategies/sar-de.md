### Die `sar` Strategie

Verwendet einen [Parabolic SAR](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:parabolic_sar) Indikator, um zu handeln, wenn sich der SAR-Trend umkehrt.

- Neigt dazu, frühere Signale als EMA-basierte Strategien zu generieren, was zu einer besseren Erfassung von Hochs und Tiefs und einem besseren Schutz vor schnellen Preissenkungen führt.
- In seitwärts gerichteten (nicht trendigen) Märkten nicht gut abschneiden und mehr Peitschenhiebe generieren als EMA-basierte Strategien.
- Am effektivsten bei kurzer Zeit (Standard ist 2 Mio.), was bedeutet, dass 50-100 Trades / Tag generiert werden, sodass sie derzeit nur im GDAX (mit 0% Herstellergebühr) verwendet werden können.
- Live getestet, [Ergebnisse hier](https://github.com/carlos8f/zenbot/pull/246#issuecomment-307528347)
