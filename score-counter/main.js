const isNumber = (x) => typeof x === 'number' && !isNaN(x)

const createScore = ({ initialValue = 0, minValue = -Infinity, maxValue = Infinity } = {}) => {
  const score = {
    value: initialValue,
    minValue,
    maxValue,
    setValue(newValue) {
      if (score.minValue <= newValue && newValue <= score.maxValue) {
        score.value = newValue
      }
    },
    increment(amount = 1) {
      score.setValue(score.value + amount)
    },
    decrement(amount = 1) {
      score.setValue(score.value - amount)
    },
    configure(config = {}) {
      if (isNumber(config.minValue)) score.minValue = config.minValue
      if (isNumber(config.maxValue)) score.maxValue = config.maxValue
    },
  }

  return score
}

const state = {
  scores: [],
  players: 0,
  scoreConfig: {
    initialValue: 0,
    minValue: 0,
    maxValue: 24,
  },
  setPlayers(players) {
    if (players > 0) {
      state.players = players
      state.scores = Array.from(
        { length: players },
        (_, index) => state.scores[index] || createScore(state.scoreConfig),
      )
    }
  },
}

state.setPlayers(2)

class ScoreButton {
  view(vnode) {
    const { label, onclick } = vnode.attrs
    return m('div.score__button', m('button', { onclick }, label))
  }
}

class Score {
  view(vnode) {
    const { score } = vnode.attrs
    return m('div.score', [
      m('span.score__text', score.value),
      m('div.score__buttons', [
        m(ScoreButton, { onclick: () => score.decrement(), label: '-' }),
        m(ScoreButton, { onclick: () => score.increment(), label: '+' }),
      ]),
    ])
  }
}

class App {
  view() {
    return m('div.page', [
      m(
        'div.scores',
        state.scores.map((score) => m(Score, { score })),
      ),
    ])
  }
}

m.mount(document.getElementById('app'), App)
