
const PromiseState = {
    Pending: 'pending',
    FullFilled: 'fullfilled',
    Rejected: 'rejected'
}

class MyPromise {
    constructor(state = PromiseState.Pending) {
        this.state = state
    }

    then(resolve, reject) {
        if (this.state === PromiseState.FullFilled) {
            resolve?.()
        } else if (this.state === PromiseState.Rejected) {
            reject?.()
        }
        return this
    }

    resolve() {
        this.state = PromiseState.FullFilled
    }

    reject() {
        this.state = PromiseState.Rejected
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