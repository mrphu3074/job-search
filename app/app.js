const { Component } = React;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: '',
            hits: [],
            total: 0,
            time: 0,
            totalPage: 0,
            currentPage: 1
        };

        var APPLICATION_ID = 'JF8Q26WWUD';
        var SEARCH_ONLY_API_KEY = '77e1fa3ab39c8751629b3b4456fda3f1';
        var INDEX_NAME = 'jobs';
        var PARAMS = {
            hitsPerPage: 10,
            maxValuesPerFacet: 8,
            facets: ['type'],
            disjunctiveFacets: ['title', 'desc', 'tags']
        };

        // Client + Helper initialization
        this.algolia = algoliasearch(APPLICATION_ID, SEARCH_ONLY_API_KEY);
        this.algoliaHelper = algoliasearchHelper(this.algolia, INDEX_NAME, PARAMS);
        this.algoliaHelper.on('result', (content, state) => {
            this.setState({
                hits: content.hits,
                total: content.nbHits,
                time: content.processingTimeMS,
                totalPage: content.nbPages
            });
        });
    }

    componentDidMount() {
        this.algoliaHelper.search();
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.state.query != nextState.query) {
            this.setState({
                currentPage: 1
            });
            const searchInputIcon = $('#search-input-icon');
            searchInputIcon.toggleClass('empty', nextState.query.trim() !== '');
            this.algoliaHelper.setCurrentPage(1).setQuery(nextState.query).search();
        } else {
            if(this.state.currentPage != nextState.currentPage) {
                this.algoliaHelper.setCurrentPage(nextState.currentPage).search();
            }
        }
    }

    handle__Search(e) {
        e.preventDefault();
        if (e.which != 13) {
            var query = e.currentTarget.value;
            this.setState({query});
        }
    }

    handle__Prev(e) {
        e.preventDefault();
        let page = this.state.currentPage - 1;
        if(page < 1) page = 1;
        this.setState({currentPage: page});
    }

    handle__Next(e) {
        e.preventDefault();
        let page = this.state.currentPage + 1;
        if(page > this.state.totalPage) page = this.state.totalPage;
        this.setState({currentPage: page});
    }

    render() {
        return (
            <div>
                <header>
                    <img src="img/instant_search_logo@2x.png"/>
                    <input id="search-input" type="text" autoComplete="off" spellCheck="false" autoCorrect="off"
                           placeholder="Search by name, brand, description..."
                           onKeyUp={this.handle__Search.bind(this)}/>

                    <div id="search-input-icon"></div>
                </header>

                <main>
                    <div id="left-column"/>
                    <div id="right-column">
                        <div id="stats">
                            {this.state.total} Results <span className="found-in">Found in {this.state.time}ms</span>
                        </div>
                        <div id="hits">
                            {this.state.hits.map((job, key) => <Job key={key} job={job}/>)}
                        </div>

                        <div id="pagination">
                            <button id="prev" onClick={this.handle__Prev.bind(this)} >Prev</button>
                            <button id="next" onClick={this.handle__Next.bind(this)} >Next</button>
                        </div>
                    </div>
                </main>

            </div>
        );
    }
}

class Job extends Component {
    constructor(props) {
        super(props);
    }

    get title() {
        return this.props.job._highlightResult.title.value;
    }

    get logo() {
        return this.props.job.companyLogo;
    }

    get desc() {
        return this.props.job._highlightResult.desc.value;
    }
    get city() {
        return this.props.job._highlightResult.city.value;
    }

    get tags() {
        const tags = [];
        for (var i in this.props.job._highlightResult.tags) {
            const tag = this.props.job._highlightResult.tags[i];
            if (tag && typeof tag == 'object' && tag['value']) {
                tags.push(tag['value']);
            }
        }
        return tags;
    }

    render() {
        return (
            <div className="hit">
                <div className="hit-image">
                    <img src={this.logo}
                         alt="{}"/>
                </div>
                <div className="hit-content">
                    <h2 className="hit-name" dangerouslySetInnerHTML={{__html: this.title}}></h2>

                    <p className="hit-description" dangerouslySetInnerHTML={{__html: this.desc}}></p>

                    <div style={{overflow: 'hidden', clear: 'both'}}>
                        <div style={{float: 'left'}}>
                            Tags:
                        </div>
                        <div style={{float: 'left', marginLeft: '10px', width: '90%'}}>
                            {this.tags.map((tag, key) => (
                                <div style={{marginBottom: '5px', overflow: 'hidden', clear: 'both'}} key={key}>
                                    <span style={{background: '#f5f5f5', padding: '3px'}}
                                          dangerouslySetInnerHTML={{__html: tag}}></span>
                                </div>
                            ))  }
                        </div>
                    </div>

                    <p>
                        Locations: <span dangerouslySetInnerHTML={{__html: this.city}}></span>
                    </p>
                </div>
            </div>
        );
    }
}


ReactDOM.render(<App/>, document.getElementById("container"));