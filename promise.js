
const PromiseState = {
    Pending: 0,
    FullFilled: 1,
    Rejected: 2
}

class MyPromise {
    constructor(state = PromiseState.Pending) {
        this.state = state
    }

    then(resolve, reject) {
        // 
    }

    resolve() {
        // 
    }

    reject() {
        // 
    }

    static deferred() {
        const promise = new MyPromise()
        return {
            promise,
            resolve: promise.resolve,
            reject: promise.reject
        }
    }
}

module.exports = MyPromise