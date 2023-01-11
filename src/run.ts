import { IExecutor } from './Executor';
import ITask from './Task';

export default async function run(executor: IExecutor, queue: AsyncIterable<ITask>, maxThreads = 0) {
    maxThreads = Math.max(0, maxThreads)

    const promises = [] as Promise<void>[]
    let limit = 0

    for await (const task of queue) {
        if (!promises[task.targetId]) {
            promises[task.targetId] = executor.executeTask(task)
        }
        else {
            promises[task.targetId] = promises[task.targetId]!.then(() => executor.executeTask(task))
        }

        if (limit === maxThreads) {
            await Promise.all(promises)
            promises.length = 0
            limit = 0
        }

        limit++
    }

    return Promise.all(promises)
}
