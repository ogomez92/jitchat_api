const PORT = 3456;

import app from './app';

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
});
