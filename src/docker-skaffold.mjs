#!/usr/bin/env node

import which from 'which'

import { spawn } from 'child_process'

const dockerComposeArgs = []
const commandParts = []

let foundSplit = false
process.argv.forEach((arg, index) => {
  if (arg === '--') {
    foundSplit = true
    return
  } else if (index < 2) {
    return
  }

  if (foundSplit) {
    commandParts.push(arg)
  } else {
    dockerComposeArgs.push(arg)
  }
})

function dockerCompose(...args) {
  return new Promise((resolve, reject) => {
    const spawned = spawn(
      ...(which.sync('docker-compose', { nothrow: true })
        ? ['docker-compose', args]
        : ['docker', ['compose', ...args]]),
      {
        shell: false,
        stdio: 'inherit'
      }
    )

    spawned.on('exit', (exitCode) => {
      if (exitCode) reject()
      resolve()
    })
  })
}

await dockerCompose(...dockerComposeArgs, 'up', '-d').catch(() =>
  process.exit(1)
)

const [commandName, ...commandArgs] = commandParts

process.stdin.resume() // so program will not close instantly

for (const signal of ['exit', 'SIGINT', 'SIGQUIT', 'SIGTERM']) {
  process.on(signal, finish)
}

const spawned = spawn(commandName, commandArgs, {
  shell: false,
  stdio: 'inherit'
})

spawned.on('error', (err) => {
  if (err.code === 'ENOENT') {
    console.error('missing command', commandName)
  } else if (err) {
    console.error(err)
  }

  finish(1)
})

spawned.on('exit', (status) => finish(status))

let finished = false
async function finish(code = 0) {
  if (!finished) {
    finished = true
    await dockerCompose(...dockerComposeArgs, 'down')
  }
  process.exit(code)
}
