import { UIPanel, UIRow, UIInput, UILink, UIList } from "../ui.js";

export class SearchPanel extends UIPanel {

	constructor(reader) {

		super();
		const strings = reader.strings;

		let searchQuery = undefined;
		const searchBox = new UIInput("search");
		searchBox.dom.placeholder = strings.get("sidebar/search/placeholder");
		searchBox.dom.onsearch = () => {

			const value = searchBox.getValue();

			if (value.length === 0) {
				this.items.clear();
			} else if (searchQuery !== value) {
				this.items.clear();
				this.doSearch(value).then(results => {

					results.forEach(data => {
						this.set(data);
					});
				});
			}
			searchQuery = value;
		};

		const ctrlRow = new UIRow();
		ctrlRow.add(searchBox);
		super.add(ctrlRow);

		this.setId("search");
		this.items = new UIList();
		this.add(this.items);
		this.reader = reader;
		//
		// improvement of the highlighting of keywords is required...
		//
	}

	/**
	 * Searching the entire book
	 * @param {*} q Query keyword
	 * @returns The search result array.
	 */
	async doSearch(q) {

		const book = this.reader.book;
		const results = await Promise.all(
			book.spine.spineItems.map(item => item.load(book.load.bind(book))
				.then(item.find.bind(item, q)).finally(item.unload.bind(item))));
		return await Promise.resolve([].concat.apply([], results));
	}

	set(data) {

		const link = new UILink("#" + data.cfi, data.excerpt);
		link.dom.onclick = () => {

			this.reader.rendition.display(data.cfi);
			return false;
		};
		this.items.add(link);
	}
}
