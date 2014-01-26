from flask import Blueprint, render_template


mod = Blueprint('glossary', __name__, static_folder='static',
                template_folder='templates')


@mod.route('/glossary')
def glossary():
    return render_template(
        'glossary.html',
        title='Glossary'
    )