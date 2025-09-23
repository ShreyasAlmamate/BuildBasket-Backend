class queryProducts {
    products = []
    query = {}
    constructor(products,query){
        this.products = products
        this.query = query
    }

    categoryQuery = () => {
        if (this.query.category && this.query.category.trim() !== '') {
            this.products = this.products.filter(c => c.category === this.query.category)
        }
        return this
    }

    ratingQuery = () => {
        if (this.query.rating && this.query.rating !== '') {
            const ratingValue = parseInt(this.query.rating)
            this.products = this.products.filter(c => c.rating >= ratingValue)
        }
        return this
    }

    searchQuery = () => {
        if (this.query.searchValue && this.query.searchValue.trim() !== '') {
            const searchTerm = this.query.searchValue.trim().toUpperCase()
            this.products = this.products.filter(p => 
                p.name.toUpperCase().includes(searchTerm) ||
                p.category.toUpperCase().includes(searchTerm) ||
                p.brand.toUpperCase().includes(searchTerm) ||
                p.description.toUpperCase().includes(searchTerm)
            )
        }
        return this
    }

    priceQuery = () => {
        if (this.query.lowPrice !== undefined && this.query.highPrice !== undefined) {
            this.products = this.products.filter(p => p.price >= this.query.lowPrice && p.price <= this.query.highPrice)
        }
        return this
    }
    sortByPrice = () => {
        if (this.query.sortPrice) {
            if (this.query.sortPrice === 'low-to-high') {
                this.products = this.products.sort(function (a,b){ return a.price - b.price})
            } else {
                this.products = this.products.sort(function (a,b){ return b.price - a.price})
            }
        }
        return this
    }

    skip = () => {
        let {pageNumber} = this.query
        const skipPage = (parseInt(pageNumber) - 1) * this.query.parPage
        let skipProduct = []

        for (let i = skipPage; i < this.products.length; i++) {
            skipProduct.push(this.products[i]) 
        }
        this.products = skipProduct
        return this
    }

    limit = () => {
        let temp = []
        if (this.products.length > this.query.parPage) {
            for (let i = 0; i < this.query.parPage; i++) {
                temp.push(this.products[i]) 
            } 
        }else {
            temp = this.products
        }
        this.products = temp 
        return this
    }

    getProducts = () => {
        return this.products
    }

    countProducts = () => {
        return this.products.length
    } 

}

module.exports = queryProducts