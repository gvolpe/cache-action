// adapted from https://github.com/c-hive/gha-npm-cache/blob/1d899ca6403e4536a2855679ab78f5b89a870863/src/save.js

import * as cache from '@actions/cache'
import * as core from '@actions/core'

async function restoreCache(id: string): Promise<void> {
  const upperId = id.toLocaleUpperCase('en-US')
  const primaryKey = core.getState(`${upperId}_CACHE_KEY`)

  if (!primaryKey) {
    return
  }

  const cacheKey = core.getState(`${upperId}_CACHE_RESULT`)
  const cachePaths = JSON.parse(
    core.getState(`${upperId}_CACHE_PATHS`)
  ) as string[]

  if (cacheKey === primaryKey) {
    core.info(
      `Cache hit occurred on key ${primaryKey}, not saving ${id} cache.`
    )
    return
  }

  // https://github.com/actions/cache/blob/9ab95382c899bf0953a0c6c1374373fc40456ffe/src/save.ts#L39-L49
  try {
    core.info(`Saving ${id} cache`)
    await cache.saveCache(cachePaths, primaryKey)
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw error
    } else if (error.name === 'ReserveCacheError') {
      core.info(error.message)
    } else {
      core.info(`[warning] ${error.message}`)
    }
  }
}

async function run(): Promise<void> {
  await restoreCache('coursier')
  await restoreCache('sbt')
  await restoreCache('mill')
  await restoreCache('ammonite')
}

async function doRun(): Promise<void> {
  try {
    await run()
  } catch (err) {
    core.setFailed(err.toString())
  }
}

doRun()
