import * as cwlTsAuto from 'cwl-ts-auto'
import { GAInputType, mapGaTypeToCommandInputParameterType } from './common'

function mapGaTypeToPrefix (gaType: string): string {
  switch (gaType) {
    case 'data_input': {
      return '--file '
    }
    case 'data_collection_input': {
      return '--file '
    }
    case 'text': {
      return '--text '
    }
    case 'boolean': {
      return '--boolean '
    }
    case 'float': {
      return '--float '
    }
    case 'integer': {
      return '--integer '
    }
    default: {
      throw Error('Input type not supported: ' + gaType)
    }
  }
}

function createCommandInputParameter (input: GAInputType): cwlTsAuto.CommandInputParameter {
  const inputParameter = new cwlTsAuto.CommandInputParameter({

    id: input.name,
    type: mapGaTypeToCommandInputParameterType(input.type)
  })
  if (inputParameter.type instanceof cwlTsAuto.CommandInputArraySchema) {
    inputParameter.type.inputBinding = new cwlTsAuto.CommandLineBinding({ prefix: (mapGaTypeToPrefix(input.type) + input.name), shellQuote: false })
  } else {
    inputParameter.inputBinding = new cwlTsAuto.CommandLineBinding({ prefix: (mapGaTypeToPrefix(input.type) + input.name), shellQuote: false })
  }
  return inputParameter
}

function generatePreprocessingToolSkeleton (): cwlTsAuto.CommandLineTool {
  const preprocessingToolSkeleton = new cwlTsAuto.CommandLineTool({
    baseCommand: 'cwl-galaxy-parser',
    cwlVersion: cwlTsAuto.CWLVersion.V1_2,
    requirements: [
      new cwlTsAuto.InlineJavascriptRequirement({}),
      new cwlTsAuto.ShellCommandRequirement({}),
      // "{...} as any" is a workaround to use the $include statement
      new cwlTsAuto.DockerRequirement({ dockerImageId: 'cwl-galaxy-parser', dockerFile: { $include: './dockerfiles/cwl-galaxy-parser/Dockerfile' } as any }),
      new cwlTsAuto.NetworkAccess({ networkAccess: true })
    ],
    inputs: [],
    outputs: []
  })

  const paramFileOuput = new cwlTsAuto.CommandOutputParameter({
    type: cwlTsAuto.CWLType.FILE,
    id: 'paramFile',
    outputBinding: new cwlTsAuto.CommandOutputBinding({ glob: '$(runtime.outdir)/galaxyInput.yml' })
  })

  const inputDatFolderOuput = new cwlTsAuto.CommandOutputParameter({
    type: cwlTsAuto.CWLType.DIRECTORY,
    id: 'inputDataFolder',
    outputBinding: new cwlTsAuto.CommandOutputBinding({ glob: '$(runtime.outdir)' })
  })
  preprocessingToolSkeleton.outputs.push(paramFileOuput)
  preprocessingToolSkeleton.outputs.push(inputDatFolderOuput)
  return preprocessingToolSkeleton
}

export function generatePreprocessingTool (gaInputs: GAInputType[]): cwlTsAuto.CommandLineTool {
  const preprocessingTool = generatePreprocessingToolSkeleton()

  for (const input of gaInputs) {
    preprocessingTool.inputs.push(createCommandInputParameter(input))
  }

  return preprocessingTool
}
