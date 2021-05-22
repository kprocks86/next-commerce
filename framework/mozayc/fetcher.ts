import { FetcherError } from '@commerce/utils/errors'
import type { Fetcher } from '@commerce/utils/types'

async function getText(res: Response) {
  try {
    return (await res.text()) || res.statusText
  } catch (error) {
    return res.statusText
  }
}

async function getError(res: Response) {
  if (res.headers.get('Content-Type')?.includes('application/json')) {
    const data = await res.json()
    return new FetcherError({ errors: data.errors, status: res.status })
  }
  return new FetcherError({ message: await getText(res), status: res.status })
}

const fetcher: Fetcher = async ({
  url,
  method = 'GET',
  variables,
  body: bodyObj,
}) => {
  console.log('URL', process.env.MOZAYC_API_URL)
  const hasBody = Boolean(variables || bodyObj)
  const body = hasBody
    ? JSON.stringify(variables ? { variables } : bodyObj)
    : undefined
  const headers = hasBody ? { 'Content-Type': 'application/json' } : undefined
  const res = await fetch('http://localhost:9000' + url!, {
    method,
    body,
    headers,
  })

  if (res.ok) {
    const { data } = await res.json()
    return data
  }

  throw await getError(res)
}

export default fetcher