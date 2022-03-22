#!/usr/bin/env cwl-runner

cwlVersion: v1.2
class: CommandLineTool
baseCommand: [planemo, run]
requirements:
  InlineJavascriptRequirement: {}
  ShellCommandRequirement: {}
  InitialWorkDirRequirement:
    listing:
      - entryname: inputDataFolder
        entry: $(inputs.inputDataFolder)
      - $(inputs.workflowInputParams)
      - class: File
        location: ./workflow.ga
      - entryname: history
        entry: "$({class: 'Directory', listing: []})"
        writable: true
  NetworkAccess:
    networkAccess: true
arguments:
    - valueFrom: "./workflow.ga"
      position: 1
    - valueFrom: $(runtime.outdir)/history
      position: 3
      prefix: "--output_directory"
    - valueFrom: "--download_outputs"
      position: 4
    - valueFrom: "external_galaxy"
      prefix: "--engine"
      position: 5
    - valueFrom: $GALAXY_URL
      shellQuote: false
      prefix: "--galaxy_url"
      position: 6
    - valueFrom: $GALAXY_API_KEY
      shellQuote: false
      prefix: "--galaxy_user_key"
      position: 7    
inputs:
    inputDataFolder:
        type: Directory
    workflowInputParams:
        type: File
        inputBinding:
            position: 2
outputs:
    history:
        type: Directory
        outputBinding:
            glob: $(runtime.outdir)/history
