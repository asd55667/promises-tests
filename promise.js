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

        try {
            callback(this.#resolve.bind(this), this.#reject.bind(this))
        } catch (err) {
            return this.#reject(err)
        }
        return this
    }

    #handleCallback(p, callback) {
        try {
            callback()
        } catch (err) {
            p.#reject(err)
        }
    }

    #handleX(p, x) {
        if (x === p) p.#reject(new TypeError(`${this}`))
        else if (x instanceof MyPromise) {
            x.then((value) => {
                this.#handleX(p, value)
            }, (reason) => {
                p.#reject(reason)
            }).then(null, (reason) => {
                p.#reject(reason)
            })
        } else if (isFunc(x) || isObj(x)) {
            const then = x?.then
            if (isFunc(then)) {
                new MyPromise(then.bind(x))
                    .then(
                        (value) => {
                            this.#handleCallback(p, () => {
                                this.#handleX(p, value)
                            })
                        },
                        (reason) => { p.#reject(reason) }
                    )
            } else {
                p.#resolve(x)
            }
        } else p.#resolve(x)
    }

    then(resolve, reject) {
        const p = new MyPromise(() => { })
        const task = () => {
            if (this.state === PromiseState.FullFilled) {
                this.#handleCallback(p, () => {
                    const x = isFunc(resolve) ? resolve(this.value) : this.value
                    this.#handleX(p, x)
                })
            } else if (this.state === PromiseState.Rejected) {
                this.#handleCallback(p, () => {
                    if (isFunc(reject)) {
                        const x = reject(this.value)
                        this.#handleX(p, x)
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

function isObj(obj) {
    return typeof obj === 'object'
}

module.exports = MyPromise
