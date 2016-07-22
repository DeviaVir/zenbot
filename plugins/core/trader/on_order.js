function onOrder (err, resp, order) {
        if (err) return get('console').error('order err', err, resp, order)
        if (resp.statusCode !== 200) {
          console.error(order)
          return get('console').error('non-200 status from exchange: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
        }
        get('console').log(('[exchange] order-id: ' + order.id).cyan, {data: {order: order}})
        function getStatus () {
          client.getOrder(order.id, function (err, resp, order) {
            if (err) return get('console').error('getOrder err', err)
            if (resp.statusCode !== 200) {
              console.error(order)
              return get('console').error('non-200 status from exchange getOrder: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
            }
            if (order.status === 'done') {
              return get('console').info(('[exchange] order ' + order.id + ' done: ' + order.done_reason).cyan, {data: {order: order}})
            }
            else {
              get('console').info(('[exchange] order ' + order.id + ' ' + order.status).cyan, {data: {order: order}})
              setTimeout(getStatus, 5000)
            }
          })
        }
        getStatus()
      }