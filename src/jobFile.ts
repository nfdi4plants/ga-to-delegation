import { GAInputType } from './common'
import * as yaml from 'js-yaml'

function generateJobFileInput (gaInput: GAInputType): any {
  const fileInput = ({ class: 'File', location: 'enter location' })
  switch (gaInput.type) {
    case 'data_input': {
      return fileInput
    }
    case 'data_collection_input': {
      const input = [fileInput, fileInput]
      return input
    } default: {
      return 'enter value'
    }
  }
}

export function generateJobFile (gaInputs: GAInputType[]): string {
  const out: any = {}
  for (const input of gaInputs) {
    out[input.name] = generateJobFileInput(input)
  }
  return yaml.dump(out, { noRefs: true })
}
