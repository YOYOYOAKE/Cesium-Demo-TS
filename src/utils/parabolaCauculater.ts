import * as Cesium from 'cesium'

const getParabola = (startPoint: [number, number], endPoint: [number, number], ratio = 0.1) => {

  // 方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
  const h = Cesium.Cartesian3.distance(
    Cesium.Cartesian3.fromDegrees(startPoint[0], startPoint[1]),
    Cesium.Cartesian3.fromDegrees(endPoint[0], endPoint[1]),
  ) * ratio // 计算顶点高度
  const L = Math.abs(startPoint[0] - endPoint[0]) > Math.abs(startPoint[1] - endPoint[1])
    ? Math.abs(startPoint[0] - endPoint[0])
    : Math.abs(startPoint[1] - endPoint[1]) // 计算横纵间距较大者

  const num = 19 // 分段数
  const result: [number, number, number][] = [] // 存储结果的数组
  let dlt = L / num // 每段的长度

  if (Math.abs(startPoint[0] - endPoint[0]) > Math.abs(startPoint[1] - endPoint[1])) {
    // 以 lng 为基准
    const delLat = (endPoint[1] - startPoint[1]) / num // 每段的纬度增量
    if (startPoint[0] - endPoint[0] > 0) dlt = -dlt // 如果起点经度大于终点经度，反向增量
    for (let i = 0; i < num; i++) {
      const tempH = h - (Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * h) / Math.pow(L, 2) // 计算当前高度
      const lng = startPoint[0] + dlt * i // 当前经度
      const lat = startPoint[1] + delLat * i // 当前纬度
      result.push([lng, lat, tempH]) // 将结果添加到数组中
    }
  } else {
    // 以 lat 为基准
    const delLng = (endPoint[0] - startPoint[0]) / num // 每段的经度增量
    if (startPoint[1] - endPoint[1] > 0) dlt = -dlt // 如果起点纬度大于终点纬度，反向增量
    for (let i = 0; i < num; i++) {
      const tempH = h - (Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * h) / Math.pow(L, 2) // 计算当前高度
      const lng = startPoint[0] + delLng * i // 当前经度
      const lat = startPoint[1] + dlt * i // 当前纬度
      result.push([lng, lat, tempH]) // 将结果添加到数组中
    }
  }
  // 落地
  result.push([endPoint[0], endPoint[1], 0]) // 添加终点

  return result // 返回结果
}

export const getParabolaCollection = (odData: { o: [number, number], d: [number, number] }[]) => {

  const parabolaCollection: [number, number, number][][] = odData.map((item: { o: [number, number], d: [number, number] }) => {
    return getParabola(item.o, item.d)
  })
  
  return parabolaCollection
}