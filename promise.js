const PromiseState = {
    Pending: 'pending',
    FullFilled: 'fullfilled',
    Rejected: 'rejected'
}

class MyPromise {
    value
    tasks = []
    state = PromiseState.Pending
    constructor(callback) {
        if (typeof callback !== 'function')
            throw new TypeError(`Promise resolver ${typeof callback} is not a function`);
    }

    then(resolve, reject) {
        const p = new MyPromise(() => { })

        const handleCallback = (callback) => {
            try {
                callback()
            } catch (err) {
                p.#reject(err)
            }
        }
        const task = () => {
            if (this.state === PromiseState.FullFilled) {
                handleCallback(() => {
                    p.#resolve(isFunc(resolve) ? resolve(this.value) : this.value)
                })
            } else if (this.state === PromiseState.Rejected) {
                handleCallback(() => {
                    if (isFunc(reject)) {
                        p.#resolve(reject(this.value))
                    } else p.#reject(this.value)
                })

            }
        }

        if (this.state === PromiseState.Pending) this.tasks.push(task)
        else setTimeout(task)
        return p
    }

    #resolve(value) {
        this.#update(value, PromiseState.FullFilled);
    }

    #reject(value) {
        this.#update(value, PromiseState.Rejected);
    }

    #update(value, state) {
        if (this.state !== PromiseState.Pending) return
        this.value = value
        this.state = state
        this.#clearTask()
    }

    #clearTask() {
        this.tasks.forEach(task => setTimeout(task))
    }

    static deferred() {
        const promise = new MyPromise(() => { })
        return {
            promise,
            resolve: promise.#resolve.bind(promise),
            reject: promise.#reject.bind(promise)
        }
    }
}

function isFunc(fn) {
    return typeof fn === 'function'
}

module.exports = MyPromise
