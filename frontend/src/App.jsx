
import { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api/recipes';

const emptyForm = {
  recipeName: '',
  category: 'Breakfast',
  ingredients: '',
  preparationSteps: '',
  cookingTime: ''
};

function App() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadRecipes() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error('Could not load recipes');
      const data = await response.json();
      setRecipes(data);
    } catch {
      setMessage('Cannot connect to the backend. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecipes();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const recipe = {
      ...form,
      cookingTime: Number(form.cookingTime)
    };

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipe)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save recipe');
      }

      setForm(emptyForm);
      setEditingId(null);
      setMessage(editingId ? 'Recipe updated successfully!' : 'Recipe added successfully!');
      await loadRecipes();
    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
    }
  }

  function editRecipe(recipe) {
    setForm({
      recipeName: recipe.recipeName || '',
      category: recipe.category || 'Breakfast',
      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join(', ')
        : recipe.ingredients || '',
      preparationSteps: recipe.preparationSteps || '',
      cookingTime: recipe.cookingTime || ''
    });
    setEditingId(recipe._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteRecipe(id) {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Unable to delete recipe');

      setMessage('Recipe deleted successfully!');
      await loadRecipes();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <header>
        <h1>🍲 Recipe Book</h1>
        <p>Discover, create and manage your favourite recipes.</p>
      </header>

      <main className="container">
        <section className="form-card">
          <h2>{editingId ? '✏️ Edit Recipe' : '➕ Add a Recipe'}</h2>

          {message && <div className="message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label htmlFor="recipeName">Recipe Name</label>
                <input
                  id="recipeName"
                  name="recipeName"
                  value={form.recipeName}
                  onChange={handleChange}
                  placeholder="e.g. Vegetable Fried Rice"
                  required
                />
              </div>

              <div>
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Dessert</option>
                  <option>Snacks</option>
                  <option>Drinks</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="cookingTime">Cooking Time (minutes)</label>
                <input
                  id="cookingTime"
                  name="cookingTime"
                  type="number"
                  min="1"
                  value={form.cookingTime}
                  onChange={handleChange}
                  placeholder="e.g. 30"
                  required
                />
              </div>

              <div>
                <label htmlFor="ingredients">Ingredients</label>
                <textarea
                  id="ingredients"
                  name="ingredients"
                  value={form.ingredients}
                  onChange={handleChange}
                  placeholder="Rice, vegetables, salt..."
                  required
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="preparationSteps">Preparation Steps</label>
                <textarea
                  id="preparationSteps"
                  name="preparationSteps"
                  value={form.preparationSteps}
                  onChange={handleChange}
                  placeholder="1. Prepare the ingredients..."
                  required
                />
              </div>
            </div>

            <button className="primary" type="submit">
              {editingId ? 'Update Recipe' : 'Add Recipe'}
            </button>

            {editingId && (
              <button
                className="secondary"
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                  setMessage('');
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </section>

        <section>
          <h2>📖 My Recipes ({recipes.length})</h2>

          {loading ? (
            <p>Loading recipes...</p>
          ) : recipes.length === 0 ? (
            <p className="empty">No recipes yet. Add your first recipe above!</p>
          ) : (
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <article className="recipe-card" key={recipe._id}>
                  <h3>{recipe.recipeName}</h3>
                  <p><strong>Category:</strong> {recipe.category}</p>
                  <p><strong>Cooking Time:</strong> {recipe.cookingTime} minutes</p>
                  <p><strong>Ingredients:</strong></p>
                  <p>
                    {Array.isArray(recipe.ingredients)
                      ? recipe.ingredients.join(', ')
                      : recipe.ingredients}
                  </p>
                  <p><strong>Preparation Steps:</strong></p>
                  <p>{recipe.preparationSteps}</p>

                  <button
                    className="secondary"
                    onClick={() => editRecipe(recipe)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete"
                    onClick={() => deleteRecipe(recipe._id)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default App;
