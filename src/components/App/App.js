import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addRecipe, removeFromCalendar } from '../../actions'
import { capitalize } from '../../utils/helper'
import { FaCalendarPlus, FaArrowCircleRight } from 'react-icons/fa'
import Modal from 'react-modal'
import Loading from 'react-loading'
import { fetchRecipes } from '../../utils/api'
import FoodList from '../FoodList'
import ShoppingList from '../ShoppingList'


class App extends Component {
  state = {
    foodModalOpen: false,
    meal: null,
    day: null,
    food: null,
    loadingFood: false,
    ingredientsModalOpen: false
  }

  openFoodModal = ({ meal, day }) => {
    this.setState(_ => ({
      foodModalOpen: true,
      meal,
      day
    }))
  }

  closeFoodModal = _ => {
    this.setState(_ => ({
      foodModalOpen: false,
      meal: null,
      day: null,
      food: null
    }))
  }

  searchFood = (e) => {
    if (!this.input.value) {
      return
    }

    e.preventDefault()

    this.setState(_ => ({ loadingFood: true }))

    fetchRecipes(this.input.value)
      .then(food => this.setState(_ => ({
        food,
        loadingFood: false
      })))
  }

  openIngredientsModal = _ => this.setState(_ => ({ ingredientsModalOpen: true }))
  closeIngredientsModal = _ => this.setState( _ => ({ ingredientsModalOpen: false }))
  generateShoppingList = _ => {
    return this.props.calendar.reduce((result, { meals }) => {
      const { breakfast, lunch, dinner } = meals

      breakfast && result.push(breakfast)
      lunch && result.push(lunch)
      dinner && result.push(dinner)

      return result
    }, [])
    .reduce((ings, { ingredientLines }) => ings.concat(ingredientLines), [])
  }

  render() {
    const { foodModalOpen, loadingFood, food, ingredientsModalOpen } = this.state
    const { calendar, remove, selectRecipe } = this.props
    const mealOrder = ['breakfast', 'lunch', 'dinner']

    return (
        <div className='container'>
          <div className='nav'>
            <h1 className='header'>UdaciMeals</h1>
            <button
              className='shopping-list'
              onClick={this.openIngredientsModal}>
                ShoppingList
              </button>
          </div>

          <ul className='meal-types'>
            {mealOrder.map(mealType => (
              <li key={mealType} className='subheader'>
                {capitalize(mealType)}
              </li>
            ))}
          </ul>
          <div className='calendar'>
            <div className='days'>
              {calendar.map(({ day }) => <h3 key={day} className='subheader'>{capitalize(day)}</h3>)}
            </div>
            <div className='icon-grid'>
              {calendar.map(({ day, meals }) => (
                <ul key={day}>
                  {mealOrder.map((meal) => (
                    <li key={meal} className='meal'>
                      {meals[meal]
                        ? <div className='food-item'>
                            <img src={meals[meal].image} alt={meals[meal].label}/>
                            <button onClick={() => remove({meal, day})}>Clear</button>
                          </div>
                        : <button onClick={_ => this.openFoodModal({ meal, day })} className='icon-btn'>
                            <FaCalendarPlus size={30}/>
                          </button>}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          <Modal
            className='modal'
            overlayClassName='overlay'
            isOpen={foodModalOpen}
            onRequestClose={this.closeFoodModal}
            contentLabel='Modal'
          >
            <div>
              {loadingFood === true
                ? <Loading delay={200} type='spin' color='#222' className='loading' />
                : <div className='search-container'>
                    <h3 className='subheader'>
                      Find a meal for {capitalize(this.state.day)} {this.state.meal}.
                    </h3>
                    <div className='search'>
                      <input
                        className='food-input'
                        type='text'
                        placeholder='Search Foods'
                        ref={(input) => this.input = input}
                      />
                      <button
                        className='icon-btn'
                        onClick={this.searchFood}>
                          <FaArrowCircleRight size={30}/>
                      </button>
                    </div>
                    {food !== null && (
                      <FoodList
                        food={food}
                        onSelect={(recipe) => {
                          selectRecipe({ recipe, day: this.state.day, meal: this.state.meal })
                          this.closeFoodModal()
                        }}
                      />)}
                  </div>}
            </div>
          </Modal>

          <Modal
            className='modal'
            overlayClassName='overlay'
            isOpen={ingredientsModalOpen}
            onRequestClose={this.closeIngredientsModal}
            contentLabel='Modal'
          >
            {ingredientsModalOpen && <ShoppingList list={this.generateShoppingList()} />}
          </Modal>
        </div>
      )
    }
  }

     
//calendar === state(redux)
const mapStateToProps = ({ calendar, food }) => {
  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  return {
    calendar: dayOrder.map(day => ({
      day,
      meals: Object.keys(calendar[day]).reduce((meals, meal) => {
        meals[meal] = calendar[day][meal]
          ? food[calendar[day][meal]]
          : null

          return meals
      }, {})
    }))
  }
}

const mapDispatchToProps = (dispatch) => ({
  selectRecipe: (data) => dispatch(addRecipe(data)),
  remove: (data) => dispatch(removeFromCalendar(data))
})

export default connect(mapStateToProps, mapDispatchToProps)(App)