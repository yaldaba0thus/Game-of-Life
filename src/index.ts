enum CellStatus {
    ALIVE = 0,
    DEAD  = 1,
}


const DEAD_COLOR   = "#032236";
const ALIVE_COLOR  = "#8E79AD";
const BORDER_COLOR = "#333676";


function modulo(num: number, remainder: number): number {
    return ((num % remainder) + remainder) % remainder; 
}


function get_random_int(max: number): number {
    return Math.floor(Math.random() * max);
}


class Game {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _width: number;
    private _height: number;
    private _rows: number;
    private _cols: number;
    private _cell_width: number;
    private _cell_height: number;
    private _current_generation: CellStatus[][];
    private _next_generation: CellStatus[][];
    private _fps: number;
    private _last_frame_time: number;

    constructor(canvas_id: string, rows: number, cols: number) {
        this._canvas = document.getElementById(canvas_id) as HTMLCanvasElement;
        this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
        if (this._ctx == null) {
            throw new Error("Failed to get canvas context");
        }

        this._width = this._canvas.width;
        this._height = this._canvas.height;
        this._rows = rows;
        this._cols = cols;
        this._cell_height = this._height / this._rows;
        this._cell_width = this._width / this._cols;
        this._last_frame_time = 0;
        this._fps = 1000 / 60;
        this._current_generation = this.random_generation(this.init_matrix());
        this._next_generation = this.init_matrix();

        this._canvas.addEventListener("mousemove", (event) => {
            let row = Math.trunc(event.y / this._cell_height);
            let col = Math.trunc(event.x / this._cell_width);

            this._current_generation[row][col] = CellStatus.ALIVE;
        });
    }

    private random_generation(matrix: CellStatus[][]): CellStatus[][] {
        let amount_alive_cells = Math.max(get_random_int(this._rows * this._cols), (this._rows * this._cols) / 2);

        while (amount_alive_cells > 0) {
            let row = get_random_int(this._rows);
            let col = get_random_int(this._cols);

            if (matrix[row][col] == CellStatus.DEAD) {
                matrix[row][col] = CellStatus.ALIVE;
                --amount_alive_cells;
            }
        }

        return matrix
    }

    private init_matrix(): CellStatus[][] {
        let matrix: CellStatus[][] = [];
        for (let row = 0; row < this._rows; ++row) {
            matrix.push([]);
            for (let col = 0; col < this._cols; ++col) {
                matrix[row].push(CellStatus.DEAD);
            }
        }

        return matrix;
    }

    private render_borders() {
        this._ctx.fillStyle = BORDER_COLOR;
        for (let row = 0; row < this._rows; ++row) {
            this._ctx.beginPath();
            this._ctx.moveTo(0, row * this._cell_height);
            this._ctx.lineTo(this._width, row * this._cell_height);
            this._ctx.stroke();
        }

        for (let col = 0; col < this._cols; ++col) {
            this._ctx.beginPath();
            this._ctx.moveTo(col * this._cell_width, 0);
            this._ctx.lineTo(col * this._cell_width, this._height);
            this._ctx.stroke();
        }
    }

    private render_matrix() {
        for (let row = 0; row < this._rows; ++row) {
            for (let col = 0; col < this._cols; ++col) {
                this._ctx.fillStyle = this._current_generation[row][col] == CellStatus.ALIVE ? ALIVE_COLOR : DEAD_COLOR;
                this._ctx.fillRect(col * this._cell_width, row * this._cell_height, this._cell_width,this._cell_height);
            }
        }
    }

    private render() {
        this._ctx.clearRect(0, 0, this._width, this._height);
        this.render_matrix();
        this.render_borders();
    }

    private count_neighbors(current_row: number, current_col: number): number {
        let amount_neighbors = 0;
        for (let dy = -1; dy <= 1; ++dy) {
            for (let dx = -1; dx <= 1; ++dx) {
                if ((dx == 0) && (dy == 0)) {
                    continue;
                }
                
                let cell_y = modulo(current_row + dy, this._rows);
                let cell_x = modulo(current_col + dx, this._cols);
                if (this._current_generation[cell_y][cell_x] == CellStatus.ALIVE) {
                    ++amount_neighbors;
                }
            }
        }

        return amount_neighbors;
    }

    private next_generation(): void {
        for (let row = 0; row < this._rows; ++row) {
            for (let col = 0; col < this._cols; ++col) {
                this._next_generation[row][col] = CellStatus.DEAD;
            }
        }    

        for (let row = 0; row < this._rows; ++row) {
            for (let col = 0; col < this._cols; ++col) {
                let amount_neighbors = this.count_neighbors(row, col);

                if (this._current_generation[row][col] == CellStatus.ALIVE) {
                    if (amount_neighbors < 2) {
                        this._next_generation[row][col] = CellStatus.DEAD;
                    } else if (amount_neighbors < 4) {
                        this._next_generation[row][col] = CellStatus.ALIVE;
                    } else {
                        this._next_generation[row][col] = CellStatus.DEAD
                    }
                } else {
                    if (amount_neighbors == 3) {
                        this._next_generation[row][col] = CellStatus.ALIVE;
                    }
                }
            }
        }
    }

    private update() {
        this.next_generation();
        [this._current_generation, this._next_generation] = [this._next_generation, this._current_generation]; 
    }

    private gameloop(timestamp: number) {
        const delta_time = timestamp - this._last_frame_time;

        if (delta_time >= this._fps) {
            this._last_frame_time = timestamp;

            this.render();
            this.update()
        }

        requestAnimationFrame(this.gameloop.bind(this));
    }

    run() {
        requestAnimationFrame(this.gameloop.bind(this));
    }
}

function main(): void {
    let game = new Game("canvas", 30, 30);
    game.run();
}

window.onload = () => {
    main();
};
