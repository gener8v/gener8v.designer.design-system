import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Card',
    family: 'screens',
    job: 'hold one self-contained thing on a hairline surface',
    use: [
      'A thing that stands on its own in a grid or a row — a feature, a product, a summary — with a kicker, a title, a body and meta.',
      'The whole card is one link target: use `CardLink`, which keeps a real anchor.',
      'An image that bleeds to the edges: `CardMedia`.',
    ],
    not: [
      {
        when: 'the surface hosts a region — a table, a form, a list — with a header',
        use: 'Panel',
        because: 'a panel is a frame for a region with a header and one action; a card is the thing itself.',
      },
      {
        when: 'the content is a document someone reads',
        use: 'Paper',
        because: 'paper is a sheet on a ground, made for reading down; a card is for scanning across.',
      },
      {
        when: 'there is a list of records, each read on its own',
        use: 'Item',
        because: 'a list of cards is a wall of boxes; an item list keeps rows quiet and aligned.',
      },
      {
        when: 'the card is a choice someone picks in a form',
        use: 'RadioCards',
        because: 'a radio card is a real radio with the whole card as its label.',
      },
    ],
    neighbours: ['Panel', 'Paper', 'Item', 'RadioCards'],
    react: ['Card', 'CardLink', 'CardKicker', 'CardTitle', 'CardBody', 'CardMeta', 'CardMedia'],
    css: ['.card'],
    page: 'components/cards.html',
  },
] satisfies When[];
