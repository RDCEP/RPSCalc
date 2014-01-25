from flask import Blueprint, request, render_template, flash, g, session, \
    redirect, url_for, abort


mod = Blueprint('calculator', __name__, url_prefix='/calculator')


@mod.route('/clear', methods=['POST',])
def clear():
    try:
        for k, v in request.get_json(force=True).iteritems():
            if k in ['trajectory', 'wind', 'solar', 'rps', 'price_and_policy']:
                session[k] = False
            else:
                session[k] = v
        session['clear'] = False
        return 'Session cleared.'
    except:
        abort(500)


@mod.route('/update', methods=['POST',])
def update():
    try:
        for k, v in request.get_json(force=True).iteritems():
            session[k] = v
        session['clear'] = False
        return 'Session updated.'
    except:
        abort(500)


@mod.route('/trajectory')
def trajectory():
    return render_template(
        'calculator/trajectory.html',
        state=session['state'],
    )


@mod.route('/carveouts')
def carveouts():
    if 'trajectory' not in session.keys():
        return redirect(url_for('calculator.trajectory'))
    return render_template(
        'calculator/carveouts.html',
        state=session['state'],
    )


@mod.route('/pricing')
def pricing():
    if not session['trajectory']:
        return redirect(url_for('calculator.trajectory'))
    if not session['wind'] or not session['solar']:
        return redirect(url_for('calculator.carveouts'))
    return render_template(
        'calculator/pricing.html',
        state=session['state'],
    )

@mod.route('/cost')
def cost():
    if not session['trajectory']:
        return redirect(url_for('calculator.trajectory'))
    if not session['wind'] or not session['solar']:
        return redirect(url_for('calculator.carveouts'))
    if not session['price_and_policy']:
        return redirect(url_for('calculator.pricing'))
    return render_template(
        'calculator/cost.html',
        state=session['state'],
    )

@mod.route('/advanced')
def advanced():
    if not session['trajectory']:
        return redirect(url_for('calculator.trajectory'))
    if not session['wind'] or not session['solar']:
        return redirect(url_for('calculator.carveouts'))
    if not session['price_and_policy']:
        return redirect(url_for('calculator.pricing'))
    return render_template(
        'calculator/advanced.html',
        state=session['state'],
    )