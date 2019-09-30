import {Compounds} from './compounds';
import {Information} from './information';
import {Diagram} from './diagram';

export class Notation {
  id: number;
  name: string;
  resource: string;
  compound: Compounds;
  canHandle: Information;
  canProduce: Information;
  isConstraint: boolean;
  bpmNotationCode: string;
  related_notation: Notation[];
}
