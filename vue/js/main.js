let eventBus = new Vue ()

Vue.component('product-review', {
    template: `

    <form class="review-form" @submit.prevent="onSubmit">

    <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
    <ul>
        <li v-for="error in errors">{{ error }}</li>
    </ul>
    </p>

    <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
    </p>

    <p>
        <label for="review">Review:</label>
        <textarea id="review" v-model="review"></textarea>
    </p>

    <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
            <option>5</option>
            <option>4</option>
            <option>3</option>
            <option>2</option>
            <option>1</option>
        </select>
    </p>

    <div>
        <p>Would you recommend this product?</p>
        
        <div class="recommend-area">
            <input type="radio" value="Yes" v-model="recommend">
            <label>Yes</label>
            <br>
            <input type="radio" value="No" v-model="recommend">
            <label>No</label>
        </div>
    </div>

    <p>
        <input type="submit" value="Submit">
    </p>

    </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods:{
        onSubmit() {
            if(this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                
                eventBus.$emit('review-submitted', productReview)

                this.name = null;
                this.review = null;
                this.rating = null;
                this.errors = []
            } else {
                this.errors = [];
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.recommend) this.errors.push("Recommend required")
            }
        }
    }
})
    


Vue.component ('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        },
    },
    template: `
        <div>
            <ul>
                <span class="tab" 
                    :class="{activeTab: selectedTab === tab}"
                    v-for="(tab, index) in tabs"
                    @click="selectedTab = tab"
                >{{ tab }}</span>
            </ul>
            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul>
                    <li v-for="review in reviews">
                        <p>{{ review.name }}</p>
                        <p>Rating: {{ review.rating }}</p>
                        <p>{{ review.review }}</p>
                    </li>
                </ul>
            </div>

            <div v-show="selectedTab === 'Make a Review'">
                <product-review></product-review>
            </div>

            <div v-show="selectedTab === 'Shipping'">
                <product-shipping></product-shipping>
            </div>

            <div v-show="selectedTab === 'Details'">
                <product-detail></product-detail>
            </div>
        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'
        }
    },
})    

Vue.component('product-shipping', {
    props: {
        type: Boolean,
        required: true
    },
    template: `
    <p>Shipping: {{ shipping }}</p>
    `,
    computed: {
        shipping() {
            return this.premium ? "Free" : 2.99;
        }
    }
})

Vue.component('product-detail', {
    props: {
        type: Array,
        required: true
    },
    template: `
        <div>
            <p>Details:</p>
            <ul>
                <li>80% cotton</li>
                <li>20% polyester</li>
                <li>Gender-neutral</li>
            </ul>
        </div>
    `
})

Vue.component ('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div class="product">
            <div class="product-image">
                <img :src="image" :alt="altText"/>
            </div>
            
            <div class="product-info">
                <h1>{{ title }}</h1>
                <p v-if="inStock">In stock
                <br>
                {{variants[selectedVariant].variantQuantity}}</p>
                <p v-else>Out of Stock
                <br>
                {{variants[selectedVariant].variantQuantity}}</p>

                <ul>
                    <li v-for="detail in details">{{ detail }}</li>
                </ul>

                <p>Shipping: {{ shipping }}</p>
                <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor:variant.variantColor
                    }"
                    @mouseover="updateProduct(index)"></div>
               
                <button
                    v-on:click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
                >
                    Add to cart
                </button>

                <button 
                    v-on:click="delFromCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
                >
                    Delete from Cart
                </button>
            </div>

        <product-tabs :reviews="reviews" :shipping="shipping" :details="details"></product-tabs>            
        
    </div>
            `,
    data () {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            altText: "A pair of socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
            {
                variantId: 2234,
                variantColor: 'green',
                variantImage: "./assets/vmSocks-green-onWhite.jpg",
                variantQuantity: 10
            },
            {
                variantId: 2235,
                variantColor: 'blue',
                variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                variantQuantity: 0
            }
        ],
        reviews: []
    }
},


    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
        if (localStorage.getItem('variants')) {
            this.variants = JSON.parse(localStorage.getItem('variants'));
        }
    },
    watch: {
        variants: {
            handler(newVariants) {
                localStorage.setItem('variants', JSON.stringify(newVariants));
            },
            deep: true
        }
    },


    methods: {
        addToCart() {
            if (this.variants[this.selectedVariant].variantQuantity > 0) {
                this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
                this.variants[this.selectedVariant].variantQuantity--;
            }
        },
        delFromCart() {
            const variantId = this.variants[this.selectedVariant].variantId;
            this.$emit('del-from-cart', variantId);
            this.variants[this.selectedVariant].variantQuantity++;
        },
        updateProduct (index) {
            this.selectedVariant = index;
            console.log(index);
        },
        addReview (productReview) {
            this.reviews.push (productReview);
        }
    },
    computed: {
        title () {
            return this.brand + ' ' + this.product;
        },
        image () {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock () {
            return this.variants[this.selectedVariant].variantQuantity;
        },
        shipping () {
            if(this.premium) {
                return "Free";
            } 
            else {
                return 2.99
            }
        }
    }
})

let app = new Vue ({
    el:'#app',
    data: {
        premium: true,
        cart: []
    },


    mounted () {
        if (localStorage.getItem('cart')) {
            this.cart = JSON.parse(localStorage.getItem('cart'));
        }
    },
    watch: {
        cart: {
            handler(newCart) {
                localStorage.setItem('cart', JSON.stringify(newCart));
            },
            deep: true
        }
    },


    methods: {
        updateCart (id) {
            this.cart.push(id);
        },
        deleteFromCart(id) {
            this.cart.pop(id);
        }
    }
})

