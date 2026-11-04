import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Connection',
    family: 'status-and-feedback',
    job: 'show an integration and the state it is in, with the way to fix it',
    use: [
      'A list of connected systems, each with its mark, name, a note and its state — connected, degraded, error, pending or off.',
      'The state is a word in `ConnectionStatus`; the dot is decorative, so colour is never the only signal.',
      'Actions to connect, reconnect or configure sit on the row in `ConnectionActions`.',
    ],
    not: [
      {
        when: 'the status is not about an integration',
        use: 'Tag',
        because: 'a tag is the general status word; `ConnectionStatus` has only the integration states.',
      },
      {
        when: 'the problem needs the reader to act before carrying on with the page',
        use: 'Alert',
        because: 'an alert is an inline banner with a title, body and action for one problem.',
      },
      {
        when: 'the thing on the row is an API key or a secret',
        use: 'KeyList',
        because: 'keys have a fingerprint, scopes, last use and expiry; a connection has none of those.',
      },
    ],
    neighbours: ['Tag', 'Alert', 'KeyList'],
    react: ['Connection', 'ConnectionMark', 'ConnectionBody', 'ConnectionName', 'ConnectionNote', 'ConnectionActions', 'ConnectionStatus'],
    css: ['.connection'],
    page: 'components/integrations.html',
  },
  {
    name: 'Credential',
    family: 'input',
    job: 'show a secret masked, with copy, reveal and rotate',
    use: [
      'An API key, token or webhook secret the person may copy or rotate; the masked value is a substitute string, not the secret.',
      'Copy works without reveal, so a key never has to be on screen to be used.',
      'A write-once secret: pass `neverReveal` and the reveal control is gone.',
    ],
    not: [
      {
        when: 'the person is typing a value in, or the value is not secret',
        use: 'Input',
        because: 'a credential displays a stored secret; an input collects one.',
      },
      {
        when: 'there are many keys to manage, with scopes and expiry',
        use: 'KeyList',
        because: 'a key list shows each key by name and fingerprint without holding the secret at all.',
      },
      {
        when: 'the text is code or a command to copy',
        use: 'CodeBlock',
        because: 'a code block shows its content in full with a copy control; a credential hides it.',
      },
    ],
    neighbours: ['Input', 'KeyList', 'CodeBlock'],
    react: ['Credential'],
    css: ['.credential'],
    page: 'components/integrations.html',
  },
  {
    name: 'KeyList',
    family: 'data',
    job: 'list API keys by name and fingerprint, with their scopes, last use and expiry',
    use: [
      'Managing API keys: each `KeyRow` shows a name, a fingerprint that identifies without exposing, scopes and when it was last used.',
      'Scopes as `Scopes` / `Scope`; mark `write` on the one that can change something so it is the one that stands out.',
      'Expiry: `expiring` is a warning because it still works today; only `expired` is an error.',
    ],
    not: [
      {
        when: 'the person needs the secret value itself, to copy',
        use: 'Credential',
        because: 'a key row never holds the secret; a credential does, masked, with copy.',
      },
      {
        when: 'the rows are general records that are not keys',
        use: 'Item',
        because: 'an item is the general record row — a title, a line of provenance, marks at the end.',
      },
      {
        when: 'the values are compared down columns or sorted',
        use: 'Table',
        because: 'a table is for values you compare down a column, with sort.',
      },
    ],
    neighbours: ['Credential', 'Item', 'Table'],
    react: ['KeyList', 'KeyRow', 'Scopes', 'Scope'],
    css: ['.key-list', '.key-row', '.scopes', '.scope'],
    page: 'components/integrations.html',
  },
  {
    name: 'Rule',
    family: 'data',
    job: 'show an event rule as a sentence — when this happens there, do that here',
    use: [
      'An automation or event rule: a trigger and its event, an arrow, then the target and its action; `enabled={false}` shows it off.',
      'An inbound webhook address with its method — `Endpoint`, in mono.',
    ],
    not: [
      {
        when: 'the steps are a sequence a person goes through',
        use: 'Stepper',
        because: 'a stepper is a position in a sequence; a rule is one trigger and one action.',
      },
      {
        when: 'the relationships are many-to-many and need a picture',
        use: 'LayeredGraph',
        because: 'a layered graph draws what covers what across layers; a rule is a single sentence.',
      },
      {
        when: 'the endpoint is a code sample to copy',
        use: 'CodeBlock',
        because: 'a code block carries a copy control and a language; `Endpoint` is a method and a URL.',
      },
    ],
    neighbours: ['Connection', 'CodeBlock', 'Item'],
    react: ['Rule', 'Endpoint'],
    css: ['.rule', '.endpoint'],
    page: 'components/integrations.html',
  },
] satisfies When[];
