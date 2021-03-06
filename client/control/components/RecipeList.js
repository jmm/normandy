import React, { PropTypes as pt } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Table, Thead, Th, Tr, Td } from 'reactable';
import classNames from 'classnames';
import moment from 'moment';
import { makeApiRequest, recipesReceived, setSelectedRecipe } from '../actions/ControlActions.js';

const BooleanIcon = props => {
  if (props.value) {
    return <i className="fa fa-lg fa-check green">&nbsp;</i>;
  }
  return <i className="fa fa-lg fa-times red">&nbsp;</i>;
};
BooleanIcon.propTypes = {
  value: pt.bool.isRequired,
};

function FilterBar({ searchText, selectedFilter, updateSearch, updateFilter }) {
  return (
    <div id="secondary-header" className="fluid-8">
      <div className="fluid-2">
        <div className="search input-with-icon">
          <input type="text" placeholder="Search" value={searchText} onChange={updateSearch} />
        </div>
      </div>
      <div id="filters-container" className="fluid-6">
        <h4>Filter By:</h4>
        <SwitchFilter
          options={['All', 'Enabled', 'Disabled']}
          selectedFilter={selectedFilter}
          updateFilter={updateFilter}
        />
      </div>
    </div>
  );
}
FilterBar.propTypes = {
  searchText: pt.string.isRequired,
  selectedFilter: pt.any.isRequired,
  updateSearch: pt.func.isRequired,
  updateFilter: pt.func.isRequired,
};

function SwitchFilter({ options, selectedFilter, updateFilter }) {
  return (
    <div className="switch">
      <div className={`switch-selection position-${options.indexOf(selectedFilter)}`}>&nbsp;</div>
      {options.map(option =>
        <span
          key={option}
          className={classNames({ active: (option === selectedFilter) })}
          onClick={() => updateFilter(option)}
        >{option}
        </span>
      )}
    </div>
  );
}
SwitchFilter.propTypes = {
  options: pt.object.isRequired,
  selectedFilter: pt.any.isRequired,
  updateFilter: pt.func.isRequired,
};

class RecipeList extends React.Component {
  propTypes = {
    dispatch: pt.func.isRequired,
    isFetching: pt.bool.isRequired,
    recipeListNeedsFetch: pt.bool.isRequired,
    recipe: pt.object.isRequired,
    recipes: pt.array.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      filteredRecipes: null,
      selectedFilter: 'All',
    };
  }

  componentWillMount() {
    const { dispatch, isFetching, recipeListNeedsFetch } = this.props;
    dispatch(setSelectedRecipe(null));

    if (recipeListNeedsFetch && !isFetching) {
      dispatch(makeApiRequest('fetchAllRecipes', {}))
      .then(recipes => dispatch(recipesReceived(recipes)));
    }
  }

  title = 'Recipes';

  viewRecipe(recipe) {
    const { dispatch } = this.props;
    dispatch(setSelectedRecipe(recipe.id));
    dispatch(push(`/control/recipe/${recipe.id}/`));
  }

  updateSearch(event) {
    this.setState({
      searchText: event.target.value,
    });
  }

  updateFilter(filterStatus) {
    const { recipes } = this.props;

    if (filterStatus === 'All') {
      this.setState({
        filteredRecipes: null,
        selectedFilter: filterStatus,
      });
    } else {
      const enabledState = filterStatus === 'Enabled';
      this.setState({
        filteredRecipes: recipes.filter(recipe => recipe.enabled === enabledState),
        selectedFilter: filterStatus,
      });
    }
  }

  render() {
    const { recipes } = this.props;
    const filteredRecipes = this.state.filteredRecipes || recipes;

    return (
      <div>
        <FilterBar
          {...this.state}
          updateFilter={::this.updateFilter}
          updateSearch={::this.updateSearch}
        />
        <div className="fluid-8">
          <Table
            id="recipe-list"
            sortable hideFilterInput
            filterable={['name', 'action']}
            filterBy={this.state.searchText}
          >
            <Thead>
              <Th column="name"><span>Name</span></Th>
              <Th column="action"><span>Action Name</span></Th>
              <Th column="enabled"><span>Enabled</span></Th>
              <Th column="is_approved"><span>Approved</span></Th>
              <Th column="last_updated"><span>Last Updated</span></Th>
            </Thead>
            {filteredRecipes.map(recipe =>
              <Tr key={recipe.id} onClick={() => { ::this.viewRecipe(recipe); }}>
                <Td column="name">{recipe.name}</Td>
                <Td column="action">{recipe.action}</Td>
                <Td column="enabled" value={recipe.enabled}>
                  <BooleanIcon value={recipe.enabled} />
                </Td>
                <Td column="is_approved" value={recipe.is_approved}>
                  <BooleanIcon value={recipe.is_approved} />
                </Td>
                <Td column="last_updated" value={recipe.last_updated}>
                  {moment(recipe.last_updated).fromNow()}
                </Td>
              </Tr>
              )
            }
          </Table>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  recipes: state.controlApp.recipes || [],
  dispatch: ownProps.dispatch,
  recipeListNeedsFetch: state.controlApp.recipeListNeedsFetch,
  isFetching: state.controlApp.isFetching,
});

export default connect(
  mapStateToProps
)(RecipeList);
