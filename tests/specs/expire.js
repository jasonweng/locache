/*jshint asi:true */

describe("Expire Calculations:", function(){

    "use strict";

    beforeEach(function(){

        // Create a partial storage (implementing set, get and remove as
        // needed for these tests) that simply stores in an object.

        var store = {}
        this.store = store
        this.storage = {
            set: function(key, value){ return store[key] = value },
            get: function(key, value){ return store[key] || null },
            remove: function(key){ delete store[key] },
            enabled: function(){ return true },
            length: function(){
                var keys = []
                for (var key in store) {
                    if (store.hasOwnProperty(key)) {
                        keys.push(key)
                    }
                }
                return keys.length
            },
            key: function(i){
                var keys = []
                for (var key in store) {
                    if (store.hasOwnProperty(key)) {
                        keys.push(key)
                    }
                }
                return keys[i]
            }
        }

        this.cache = locache.createCache({storage:this.storage})

        this.now = new Date().getTime()
        this.past = this.now / 10
        this.future = this.now * 10

    })

    it("should test key has expired", function(){

        var key =  "mykey", expireKey = this.cache.expirePrefix + key

        // Now manually set the expire date as in the past.
        this.store[expireKey] = this.past
        expect(this.cache.hasExpired(key)).toBe(true)

        // set the expire to "now", minus a second to make sure its just
        // expired.
        this.store[expireKey] =  this.now - 1
        expect(this.cache.hasExpired(key)).toBe(true)

    })

    it("should test key has not expired", function(){

        var key =  "mykey", expireKey = this.cache.expirePrefix + key

        // set the expire to "now", plus 1 seconds to make sure its not quite
        // expired yet.
        this.store[expireKey] =  this.now + 1
        expect(this.cache.hasExpired(key)).toBe(false)

        // Finally, test the future.
        this.store[expireKey] =  this.future
        expect(this.cache.hasExpired(key)).toBe(false)

    })


    it("should test cleaning up expired values", function(){

        var key1 =  "mykey1",
            cacheKey1 = this.cache.cachePrefix + key1,
            expireKey1 = this.cache.expirePrefix + key1,
            key2 =  "mykey2",
            cacheKey2 = this.cache.cachePrefix + key2,
            expireKey2 = this.cache.expirePrefix + key2

        // Bypass the normal setting mechanisims by manually calling the
        // storage wrapper around localStorage.
        this.store[cacheKey1] = "value1"
        this.store[cacheKey2] = "value2"

        // set the first value to expire on a date in the past, and then
        // second to expire in the future.
        this.store[expireKey1] = this.past
        this.store[expireKey2] = this.future

        // Both values should be stored in localStorage - by passing the
        // normal get method to avoid the checks for validation
        expect(this.store[cacheKey1]).toBe("value1")
        expect(this.store[cacheKey2]).toBe("value2")

        // Perform a cleanup.
        this.cache.cleanup()

        // Check the values again, the first should have been removed but the
        // second should be as originally stored.
        expect(this.store[cacheKey1]).toBe(undefined)
        expect(this.cache.get(cacheKey1)).toBe(null)
        expect(this.store[cacheKey2]).toBe("value2")

    })

})