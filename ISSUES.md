# ISSUES

1. `ModuleNotFoundError: No module named 'jwt'`

Likely cause: PyJWT not installed properly in current environment. If using conda, use `conda install PyJWT`

2. `ReferenceError: primordials is not defined`

Check node version (tested with v11.15.0). Recommend using `nvm`.