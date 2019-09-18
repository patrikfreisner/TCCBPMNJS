import {Notation} from './notation';

export class Diagram {
  id?: number;
  // Uncomment this when create field at Rails
  // name: string;
  bpm_diagram_code: string;
  constraintLimit: number;
  notation: Notation[];
}
