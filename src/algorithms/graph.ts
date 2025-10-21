export type Graph = number[][]; // adjacency list: for vertex i, neighbors in graph[i]

export function createGraph(
    numVertices: number,
    edges: Array<[number, number]>,
    directed = false,
): Graph {
    const g: Graph = Array.from({ length: numVertices }, () => []);
    for (const [u, v] of edges) {
        g[u].push(v);
        if (!directed) g[v].push(u);
    }
    return g;
}

export function hasCycleUndirected(graph: Graph): boolean {
    const n = graph.length;
    const visited = new Array<boolean>(n).fill(false);

    function dfs(u: number, parent: number): boolean {
        visited[u] = true;
        for (const v of graph[u]) {
            if (!visited[v]) {
                if (dfs(v, u)) return true;
            } else if (v !== parent) {
                return true;
            }
        }
        return false;
    }

    for (let i = 0; i < n; i++) {
        if (!visited[i] && dfs(i, -1)) return true;
    }
    return false;
}

export function hasCycleDirected(graph: Graph): boolean {
    const n = graph.length;
    const state = new Array<number>(n).fill(0); // 0=unvisited,1=visiting,2=done

    function dfs(u: number): boolean {
        state[u] = 1;
        for (const v of graph[u]) {
            if (state[v] === 0) {
                if (dfs(v)) return true;
            } else if (state[v] === 1) {
                return true;
            }
        }
        state[u] = 2;
        return false;
    }

    for (let i = 0; i < n; i++) {
        if (state[i] === 0 && dfs(i)) return true;
    }
    return false;
}

export function hasCycle(graph: Graph, directed = false): boolean {
    return directed ? hasCycleDirected(graph) : hasCycleUndirected(graph);
}
