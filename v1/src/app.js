const ReqJson = {
  get(url) {
    return fetch(url, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    }).then((res) => res.json())
  },
}

async function runApp() {
  Util.disableLog()

  Util.log('App load')

  const storage = new Storage()
  const view = new View()
  const deps = { storage, view, links }

  Business.initialize(deps)
}

window.onload = runApp
