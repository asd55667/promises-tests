
const PromiseState = {
    Pending: 'pending',
    FullFilled: 'fullfilled',
    Rejected: 'rejected'
}

class MyPromise {
    value
    tasks = []
    constructor(state = PromiseState.Pending) {
        this.state = state
    }

    then(resolve, reject) {
        const task = () => {
            if (this.state === PromiseState.FullFilled) {
                try {
                    resolve?.(this.value)
                } catch (err) {
                    this.value = err
                }
            } else if (this.state === PromiseState.Rejected) {
                try {
                    reject(this.value)
                } catch (err) {
                    this.value = err
                }
            }
        }
        if (this.state === PromiseState.Pending) this.tasks.push(task)
        else setTimeout(task)
        return this
    }

    resolve(value) {
        this.#update(value, PromiseState.FullFilled);
    }

    reject(value) {
        this.#update(value, PromiseState.Rejected);
    }

    #update(value, state) {
        if (this.state !== PromiseState.Pending) return
        this.value = value
        this.state = state
        this.tasks.forEach(task => setTimeout(task))
    }

    static deferred() {
        const promise = new MyPromise()
        return {
            promise,
            resolve: promise.resolve.bind(promise),
            reject: promise.reject.bind(promise)
        }
    }
}

module.exports = MyPromise