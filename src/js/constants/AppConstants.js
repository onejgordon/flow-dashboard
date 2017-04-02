var AppConstants = {
	YEAR: "2017",
	SITENAME: "Flow",
	AUTHOR: "Jeremy Gordon",
	PERSISTENCE: "bootstrap",
	USER_STORAGE_KEY: 'flowUser',
	HABIT_WEEK_START: 0, // Sunday (d.getDay())
	JOURNAL_START_HOUR: 21,
	JOURNAL_END_HOUR: 4,
	USER_ADMIN: 2,
	SECURE_BASE: "https://genzai-app.appspot.com",
	TAGLINE: "Flow is a habit tracker and personal data analytics app that lets you keep focus on what matters. Flow owns none of your data. That's yours.",
	INTEGRATIONS: [
        { value: 'pocket', label: "Pocket" },
        { value: 'goodreads', label: "Goodreads" },
        { value: 'evernote', label: "Evernote" },
        { value: 'github', label: "Github" },
        { value: 'gfit', label: "Google Fit" },
        { value: 'bigquery', label: "BigQuery", admin: true}
    ],
	// Habits
	COMMIT_COLOR: '#F9D23D'
};

module.exports = AppConstants;