import type { IDynamic } from '../interfaces/dynamic.interface';
import { Mesh } from './mesh';
import { Inputs } from './inputs';
import type { ICartesian } from '../interfaces/cartesian.interface';

export class State implements IDynamic {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    inputs: Inputs;
    private currentMesh: Mesh | null = null;

    dynamicChildren: IDynamic[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.inputs = new Inputs(
            false,
            false,
            false,
            false,
            false,
            false,
            false
        );
        this.setupInputListeners();
        this.setupMeshSelector();
    }

    private setupInputListeners(): void {
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (key === 'x') this.inputs.x = true;
            if (key === 'y') this.inputs.y = true;
            if (key === 'z') this.inputs.z = true;
            if (key === 'r') this.inputs.r = true;
            if (key === 'control') this.inputs.control = true;
            if (key === 'shift') this.inputs.shift = true;
            if (key === 'alt') this.inputs.alt = true;
        });

        window.addEventListener('keyup', (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (key === 'x') this.inputs.x = false;
            if (key === 'y') this.inputs.y = false;
            if (key === 'z') this.inputs.z = false;
            if (key === 'r') this.inputs.r = false;
            if (key === 'control') this.inputs.control = false;
            if (key === 'shift') this.inputs.shift = false;
            if (key === 'alt') this.inputs.alt = false;
        });
    }

    private setupMeshSelector(): void {
        const meshSelect = document.getElementById(
            'meshSelect'
        ) as HTMLSelectElement;
        if (meshSelect) {
            this.loadMeshManifest(meshSelect);
            meshSelect.addEventListener('change', async (event) => {
                const selectElement = event.target as HTMLSelectElement;
                const selectedOption =
                    selectElement.options[selectElement.selectedIndex];
                await this.updateSelected(
                    selectElement.value,
                    selectedOption.dataset.position,
                    selectedOption.dataset.rotation
                );
            });
        }
    }

    private async updateSelected(
        fileName: string,
        positionJson: string | undefined,
        rotationJson: string | undefined
    ) {
        if (fileName) {
            const position: ICartesian = JSON.parse(positionJson || '{}');
            const rotation: ICartesian = JSON.parse(rotationJson || '{}');
            await this.loadMesh(fileName, position, rotation);
        }
    }

    private async loadMeshManifest(
        meshSelect: HTMLSelectElement
    ): Promise<void> {
        try {
            const response = await fetch('meshes/manifest.json');
            const data = await response.json();

            for (const meshData of data.meshes) {
                const option = document.createElement('option');
                option.value = meshData.file;
                option.textContent = meshData.name;
                option.dataset.position = JSON.stringify(meshData.position);
                option.dataset.rotation = JSON.stringify(meshData.rotation);
                meshSelect.appendChild(option);
            }

            const startIndex = Math.floor(Math.random() * data.meshes.length);

            this.updateSelected(
                data.meshes[startIndex].file,
                JSON.stringify(data.meshes[startIndex].position),
                JSON.stringify(data.meshes[startIndex].rotation)
            );
        } catch (error) {
            console.error('Failed to load mesh manifest:', error);
        }
    }

    private async loadMesh(
        fileName: string,
        position?: ICartesian,
        rotation?: ICartesian
    ): Promise<void> {
        // Remove previous mesh
        if (this.currentMesh) {
            const index = this.dynamicChildren.indexOf(this.currentMesh);
            if (index > -1) {
                this.dynamicChildren.splice(index, 1);
            }
        }

        // Load new mesh
        const mesh = new Mesh([], []);
        await mesh.load(fileName);

        // Apply rotation if provided
        if (rotation) {
            if (rotation.x !== undefined && rotation.x !== 0)
                mesh.rotateX(rotation.x);
            if (rotation.y !== undefined && rotation.y !== 0)
                mesh.rotateY(rotation.y);
            if (rotation.z !== undefined && rotation.z !== 0)
                mesh.rotateZ(rotation.z);
        }

        // Apply translation if provided
        if (position) {
            if (position.x !== undefined && position.x !== 0)
                mesh.translateX(position.x);
            if (position.y !== undefined && position.y !== 0)
                mesh.translateY(position.y);
            if (position.z !== undefined && position.z !== 0)
                mesh.translateZ(position.z);
        }

        this.dynamicChildren.push(mesh);
        this.currentMesh = mesh;
    }

    async init(): Promise<void> {}

    update(deltaTime: number): void {
        // Update state logic here
        for (const child of this.dynamicChildren) {
            child.update(deltaTime, this.inputs);
        }
    }

    render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const child of this.dynamicChildren) {
            child.render(this.ctx);
        }
    }
}
