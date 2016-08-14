rs.max_diff = Math.max(0, n(rs.max_diff)
      .subtract(n(tick.vol).multiply(constants.max_diff_decay))
      .value())