import { getPreviousMonday } from './Utils/utils'

export const defaultDateRange = (aggLevel, lastUpdate) => {
  if (aggLevel === 'Month') {
    return [
      new Date(lastUpdate.getFullYear() - 1, lastUpdate.getMonth(), 1),
      new Date(lastUpdate.getFullYear(), lastUpdate.getMonth(), 0)
    ]
  } else if (aggLevel === 'Week') {
    const lower = new Date(
      lastUpdate.getFullYear(),
      lastUpdate.getMonth() - 3,
      lastUpdate.getDate() + 1
    )

    return [
      new Date(getPreviousMonday(lower)),
      new Date(
        lastUpdate.getFullYear(),
        lastUpdate.getMonth(),
        lastUpdate.getDate(),
        23,
        59
      )
    ]
  } else if (aggLevel === 'Day') {
    return [
      new Date(
        lastUpdate.getFullYear(),
        lastUpdate.getMonth() - 1,
        lastUpdate.getDate() + 1
      ),
      new Date(
        lastUpdate.getFullYear(),
        lastUpdate.getMonth(),
        lastUpdate.getDate(),
        23,
        59
      )
    ]
  }
}
