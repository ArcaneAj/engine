import type { IRenderable } from './renderable.interface';
import type { IUpdateable } from './updateable.interface';

export interface IDynamic extends IUpdateable, IRenderable {}
