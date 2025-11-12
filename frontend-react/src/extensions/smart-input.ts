import { Extension, nodeInputRule } from '@tiptap/core'
import type { CalloutVariant } from './callout'

const CALLOUT_INPUT_REGEX = /^:::(info|success|warning|idea|note)\s$/
const TOGGLE_INPUT_REGEX = /^::toggle\s$/

export const SmartInput = Extension.create({
  name: 'smartInput',

  addInputRules() {
    return [
      nodeInputRule({
        find: CALLOUT_INPUT_REGEX,
        type: this.editor.schema.nodes.callout,
        getAttributes: (match) => {
          const variant = match[1] as CalloutVariant
          return { variant }
        },
      }),
      nodeInputRule({
        find: TOGGLE_INPUT_REGEX,
        type: this.editor.schema.nodes.details ?? this.editor.schema.nodes.toggle,
        getAttributes: () => ({}),
      }),
    ]
  },
})


