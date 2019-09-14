import {Notation} from './notation';

export class Diagram {
  id?: number;
  bpm_diagram_code: string;
  constraintLimit: number;
  notation: Notation[];
}
