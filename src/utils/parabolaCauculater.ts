import * as Cesium from 'cesium'

const getParabola = (startPoint: [number, number], endPoint: [number, number]) => {

  // 该算法的原理为抛物线方程 y=-(4h/L^2)*x^2+H 。式中H为抛物线的顶点高度，L为抛物线的跨度，即从起点到终点的水平距离。
  // h和L均已知，则可以根据抛物线方程求出抛物线上任意一点的坐标。

  // 计算顶点高度H，为两点之间的距离的0.1倍
  const H = Cesium.Cartesian3.distance(
    Cesium.Cartesian3.fromDegrees(startPoint[0], startPoint[1]),
    Cesium.Cartesian3.fromDegrees(endPoint[0], endPoint[1]),
  ) * 0.1

  // 将路径分为 n 段
  const n = 29

  // 结果数组，初始化添加起点坐标
  const result: [number, number, number][] = [
    [startPoint[0], startPoint[1], 0]
  ]

  if (Math.abs(startPoint[0] - endPoint[0]) > Math.abs(startPoint[1] - endPoint[1])) {
    // 当经度之差大于纬度之差时，选取经度作为基准

    // 计算每段的经度增量作为步长
    const L = Math.abs(startPoint[0] - endPoint[0])
    let step = L / n

    // 计算每段的纬度增量
    const delLat = (endPoint[1] - startPoint[1]) / n

    // 如果起点经度大于终点经度，反向计算
    if (startPoint[0] - endPoint[0] > 0) step = -step

    for (let i = 1; i < n; i++) {
      // 计算当前高度
      const h = H - (Math.pow(-0.5 * L + Math.abs(step) * i, 2) * 4 * H) / Math.pow(L, 2)

      // 一次循环后的经度，此时的step为经度增量
      const lng = startPoint[0] + step * i

      // 一次循环后的纬度
      const lat = startPoint[1] + delLat * i

      result.push([lng, lat, h])
    }

  } else {
    // 当纬度之差大于经度之差时，选取纬度作为基准

    const L = Math.abs(startPoint[1] - endPoint[1])
    let step = L / n

    const delLng = (endPoint[0] - startPoint[0]) / n

    if (startPoint[1] - endPoint[1] > 0) step = -step

    for (let i = 0; i < n; i++) {
      const h = H - (Math.pow(-0.5 * L + Math.abs(step) * i, 2) * 4 * H) / Math.pow(L, 2)
      const lng = startPoint[0] + delLng * i
      const lat = startPoint[1] + step * i
      result.push([lng, lat, h])
    }

  }

  // 添加终点
  result.push([endPoint[0], endPoint[1], 0])

  return result
}

export const getParabolaCollection = (odData: { o: [number, number], d: [number, number] }[]) => {

  const parabolaCollection: [number, number, number][][] = odData.map((item: { o: [number, number], d: [number, number] }) => {
    return getParabola(item.o, item.d)
  })

  return parabolaCollection
}