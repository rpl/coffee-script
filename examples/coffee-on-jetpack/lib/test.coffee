exports.test: "coffee"

exports.main: (options, callbacks) ->
  console.log "hello world... from coffee"
  callbacks.quit "OK"
