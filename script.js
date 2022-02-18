const music = new Audio('music.wav')
const sfx_hmm1 = new Audio('hmm1.mp3')
const sfx_hmm2 = new Audio('hmm2.mp3')
const sfx_arrest = new Audio('arrest.mp3')

const suspects = [
  { type: 'suspect', icon: '🤓', name: 'Von Ludendorf' },
  { type: 'suspect', icon: '😍', name: 'Dr Svett' },
  { type: 'suspect', icon: '😎', name: 'Mr Hallburg' },
  { type: 'suspect', icon: '😵', name: 'General Rumpmas' },
  { type: 'suspect', icon: '🤠', name: 'Officer Pattapat' },
]

const items = [
  { type: 'item', icon: '💉', name: 'Poison' },
  { type: 'item', icon: '🔪', name: 'Knife' },
  { type: 'item', icon: '🔫', name: 'Gun' },
  { type: 'item', icon: '🕰', name: 'Clock' },
  { type: 'item', icon: '🏺', name: 'Vase' },
]

const rooms = [
  { type: 'room', color: '#ff0000', name: 'Kitchen' },
  { type: 'room', color: '#00ff00', name: 'Study' },
  { type: 'room', color: '#00ffff', name: 'Living' },
  { type: 'room', color: '#ffff00', name: 'Storage' },
  { type: 'room', color: '#ff00ff', name: 'Bedroom' },
]

const app = Vue.createApp({
  template: `
    <div style="height: 100%; display: flex; flex-direction: column;">
      <div style="display: flex; padding: 5px;">
        <div>
          <img src="investigator.svg"/>
        </div>
        <div style="flex: 1 1 auto; min-width: 0; padding: 10px; text-align: center;">
          Looks like we got a suspect on the loose...

          <button 
            @click="investigate()"
            style="width: 100%; border-radius: 9999px; padding: 5px; margin: 20px 0;"
            :disabled="arrested || !remainingGuesses"
          >
            <span v-if="arrested">
              Well done! Let's go grab a pint now 🍻
            </span>
            <span v-else-if="remainingGuesses">
              Investigate! [{{remainingGuesses}} remain]
            </span>
            <span v-else="">
              Dang it! They got away...
            </span>
          </button>
        </div>
      </div>

      <div class="guesses" ref="guesses">
        <div 
          v-for="(guess, index) in guesses" 
          style="margin: 10px; border: 1px solid #333; border-radius: 10px; padding: 10px; color: #fff;"
          :style="{ background: numberOfCorrectLeads(guess) == 3 ? 'green' : '#333'}"
        >
          <div>
            #{{index + 1}}:
            <span v-if="numberOfCorrectLeads(guess)">
              ✅x{{numberOfCorrectLeads(guess)}}
            </span>
            <span v-else>
              ❌
            </span>
          </div>
          <div v-for="lead in guess" style="display: inline-flex; flex-wrap: wrap; align-items: center;">
            <LeadBox :lead="lead"/>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap;">
          <LeadBox v-for="lead in currentGuess" :lead="lead"/>
          <button v-if="currentGuess.length" style="border-radius: 4px; background: #000; color: #fff;" @click="undoLead()">
            ↩
          </button>
        </div>
      </div>

      <div style="padding: 5px;">
        Suspect
        <div style="display: flex; flex-wrap: wrap;">
          <LeadBox v-for="suspect in suspects" :lead="suspect" @click="addToGuess(suspect)"/>
        </div>
        
        Item
        <div style="display: flex; flex-wrap: wrap;">
          <LeadBox v-for="item in items" :lead="item" @click="addToGuess(item)"/>
        </div>

        Room
        <div style="display: flex; flex-wrap: wrap;">
          <LeadBox v-for="room in rooms" :lead="room" @click="addToGuess(room)"/>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      solution: {
        suspect: suspects[Math.floor(Math.random() * suspects.length)],
        item: items[Math.floor(Math.random() * items.length)],
        room: rooms[Math.floor(Math.random() * rooms.length)],
      },
      maxGuesses: 10,
      guesses: [],
      currentGuess: [],
      arrested: false
    }
  },
  computed: {
    suspects() { return suspects },
    items() { return items },
    rooms() { return rooms },
    remainingGuesses() { return this.maxGuesses - this.guesses.length }
  },
  methods: {
    investigate() {
      if (this.currentGuess.length == 3) {
        const correctLeads = this.numberOfCorrectLeads(this.currentGuess)
        if (correctLeads == 3) {
          sfx_arrest.play()
          this.arrested = true
        } else if (correctLeads > 0) {
          sfx_hmm1.play()
        } else {
          sfx_hmm2.play()
        }
        this.guesses.push(this.currentGuess)
        this.currentGuess = []
        this.scrollToBottom()
      }
    },
    numberOfCorrectLeads(guess) {
      let result = 0;
      if (guess.includes(this.solution.suspect)) {
        result++
      }
      if (guess.includes(this.solution.item)) {
        result++
      }
      if (guess.includes(this.solution.room)) {
        result++
      }
      return result
    },
    undoLead() {
      this.currentGuess.length -= 1
      this.scrollToBottom()    
    },
    addToGuess(lead) {
      if (this.currentGuess.length < 3 && !this.arrested) {
        this.currentGuess.push(lead)
        this.scrollToBottom()
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.$refs.guesses.scrollTop = 100000;
      })
    }
  }
})

app.component('LeadBox', {
  props: ['lead'],
  template: `
    <div class="leadBox" :style=" { background: lead.color }">
      <div v-if="lead.icon" style="margin-right: 4px;">{{ lead.icon }}</div>
      <div>{{ lead.name }}</div>
    </div>
  `
})

app.mount('#app')

document.addEventListener('click', e => {
  music.loop = true
  music.play()
})