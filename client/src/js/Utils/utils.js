import { select } from 'd3-selection'
import { csvParse } from 'd3-dsv'

module.exports = {
  loadRawCsv: function loadRawCsv(urls) {
    const prom = urls.map(url => fetch(url))

    const f = Promise.all(prom)
      .then(responses => Promise.all(responses.map(res => res.text())))
      .then(texts => Promise.all(texts.map(text => csvParse(text))))
      .then(function(csvFile) {
        return csvFile
      })

    return f
  },

  arrayRemove: function arrayRemove(arr, value) {
    return arr.filter(function(ele) {
      return ele != value
    })
  },

  deque: function deque(arr, item) {
    arr.push(item)
    // console.dir(arr)
    if (arr.length > 2) {
      arr.shift()
    }
    return arr
  },

  getPreviousMonday: function getPreviousMonday(date) {
    const day = date.getDay()
    if (date.getDay() == 1) {
      return date.setDate(date.getDate())
    } else {
      return date.setDate(date.getDate() - day + 1)
    }
  },

  transactionsQuery: function transactionsQuery(array, value1, attr, value2) {
    function findWithAttr(array, attr, value) {
      // Given an array of arrays
      // find the child array where
      for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
          return i
        }
      }
      return -1
    }

    const pos = findWithAttr(array, 'idr_final_store', value1)
    if (pos > -1) {
      const data = array[pos]['data']
      const subPos = findWithAttr(data, attr, value2)
      return data[subPos]
    } else {
      return null
    }
  },

  newCustomersQuery: function newCustomersQuery(array, value1, attr, value2) {
    function findWithAttr(array, attr, value) {
      // Given an array of arrays
      // find the child array where
      for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
          return i
        }
      }
      return -1
    }

    const pos = findWithAttr(array, 'store_num', value1)
    if (pos > -1) {
      const data = array[pos]['data']
      const subPos = findWithAttr(data, attr, value2)
      return data[subPos]
    } else {
      return null
    }
  },

  findWithAttr: function findWithAttr(array, attr, value) {
    // Given an array of arrays
    // find the child array where
    for (var i = 0; i < array.length; i++) {
      if (array[i][attr] === value) {
        return i
      }
    }
    return -1
  },

  flatten: function flatten(data, colName) {
    // takes array of array of objects,
    // takes a single column,
    // and returns the column as a single array
    return [].concat(
      ...data.map(set => {
        return set.data.map(row => {
          return row[colName]
        })
      })
    )
  },

  swap: function swap(json) {
    var ret = {}
    for (var key in json) {
      ret[json[key]] = key
    }
    return ret
  },

  wrap: function wrap(text, width) {
    return text.each(function() {
      var text = select(this),
        words = text
          .text()
          .split(/\s+/)
          .reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr('y') || 0,
        dy = parseFloat(text.attr('dy') || 0),
        tspan = text
          .text(null)
          .append('tspan')
          .attr('x', 0)
          .attr('y', y)
          .attr('dy', dy + 'em')

      // console.log(text, line, words[0].length, words, lineHeight)
      // if (words[0].length === 0) {
      //   return
      // }

      // console.log(
      //   text.selectAll('tspan').each(function() {
      //     select(this)
      //   })
      // )

      while ((word = words.pop())) {
        line.push(word)
        tspan.text(line.join(' '))
        if (tspan.node().getComputedTextLength() > width && line.length > 1) {
          line.pop()
          tspan.text(line.join(' '))
          line = [word]
          tspan = text
            .append('tspan')
            // .attr('class', 'tspanned')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
            .text(word)
        }
      }
    })
  },

  extentPad: function extentPad(extent) {
    {
      const range = extent[1] - extent[0]
      return [extent[0] - range * 0.05, extent[1] + range * 0.05]
    }
  }
}
